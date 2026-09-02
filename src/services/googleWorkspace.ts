/**
 * Google Workspace Integration Service
 * Manages Firebase Auth token acquisition with Drive and Sheets scopes,
 * Google Drive slide uploads, and Google Sheets topic syncing.
 */

import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
  User,
  signOut,
} from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';
import { Slide } from '../types';

// Initialize Firebase App & Auth
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);

export const provider = new GoogleAuthProvider();
// Required Workspace Scopes
provider.addScope('https://www.googleapis.com/auth/presentations');
provider.addScope('https://www.googleapis.com/auth/drive.file');
provider.addScope('https://www.googleapis.com/auth/spreadsheets');
provider.setCustomParameters({
  prompt: 'consent',
});

// Flag to indicate if we are in the middle of a sign-in flow.
let isSigningIn = false;
// Cache the access token strictly in memory (do not store in localStorage/sessionStorage)
let cachedAccessToken: string | null = null;
let currentUser: User | null = null;

// Initialize auth state listener
export const initAuth = (
  onAuthSuccess?: (user: User, token: string) => void,
  onAuthFailure?: () => void
) => {
  return onAuthStateChanged(auth, async (user: User | null) => {
    currentUser = user;
    if (user) {
      if (cachedAccessToken) {
        if (onAuthSuccess) onAuthSuccess(user, cachedAccessToken);
      } else if (!isSigningIn) {
        cachedAccessToken = null;
        if (onAuthFailure) onAuthFailure();
      }
    } else {
      cachedAccessToken = null;
      if (onAuthFailure) onAuthFailure();
    }
  });
};

export const formatAuthErrorMessage = (error: any): string => {
  if (!error) return 'Terjadi kesalahan saat otentikasi Google.';
  const code = error.code || '';
  const message = error.message || '';

  if (code === 'auth/popup-closed-by-user' || message.includes('popup-closed-by-user')) {
    return 'Jendela login Google ditutup sebelum proses selesai. Silakan klik tombol untuk mencoba login kembali.';
  }
  if (code === 'auth/cancelled-popup-request' || message.includes('cancelled-popup-request')) {
    return 'Permintaan login Google sebelumnya dibatalkan. Silakan coba lagi.';
  }
  if (code === 'auth/popup-blocked' || message.includes('popup-blocked')) {
    return 'Jendela popup login Google diblokir oleh browser. Harap izinkan pop-up atau buka aplikasi di jendela/tab baru.';
  }
  if (code === 'auth/network-request-failed' || message.includes('network-request-failed')) {
    return 'Koneksi jaringan terputus saat menghubungi server Google. Harap periksa koneksi internet Anda.';
  }
  if (code === 'auth/unauthorized-domain' || message.includes('unauthorized-domain')) {
    return 'Domain web ini belum didaftarkan di Authorized Domains Firebase Auth.';
  }
  return error.message || 'Gagal melakukan login dengan Google.';
};

/**
 * Sign in with Google using Firebase Auth popup and retrieve the OAuth access token
 */
export const googleSignIn = async (): Promise<{ user: User; accessToken: string }> => {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error('Gagal mendapatkan token akses Google Drive/Sheets dari Firebase Auth');
    }

    cachedAccessToken = credential.accessToken;
    currentUser = result.user;
    return { user: result.user, accessToken: cachedAccessToken };
  } catch (error: any) {
    const isUserCancelled = error?.code === 'auth/popup-closed-by-user' || error?.message?.includes('popup-closed-by-user');
    if (isUserCancelled) {
      console.warn('Google sign-in popup was closed by the user.');
    } else {
      console.error('Google sign in error:', error);
    }
    const friendlyError = new Error(formatAuthErrorMessage(error));
    (friendlyError as any).code = error?.code;
    throw friendlyError;
  } finally {
    isSigningIn = false;
  }
};

/**
 * Get the cached access token or prompt sign in if not authenticated
 */
export const getAccessToken = async (): Promise<string | null> => {
  return cachedAccessToken;
};

export const getStoredGoogleToken = (): string | null => {
  return cachedAccessToken;
};

/**
 * Acquire Google OAuth access token with Drive & Sheets scopes
 */
export async function authenticateGoogle(): Promise<string> {
  if (cachedAccessToken) {
    return cachedAccessToken;
  }
  const result = await googleSignIn();
  return result.accessToken;
}

export const logoutGoogle = async () => {
  await signOut(auth);
  cachedAccessToken = null;
  currentUser = null;
};

export const getCurrentUser = (): User | null => currentUser;

/**
 * Creates a folder on Google Drive and uploads rendered carousel slides using multipart/related
 */
export async function uploadCarouselToDrive(
  token: string,
  topic: string,
  slides: { filename: string; blob: Blob }[],
  onProgress?: (index: number, total: number, message: string) => void
): Promise<{ folderUrl: string; folderId: string }> {
  if (!slides || slides.length === 0) {
    throw new Error('Tidak ada gambar slide yang berhasil dirender untuk diunggah ke Google Drive.');
  }

  const sanitizedTopic = (topic || 'CarouselX').slice(0, 40).replace(/[/\\?%*:|"<>]/g, '_');
  const folderName = `Carousel - ${sanitizedTopic}`;

  onProgress?.(0, slides.length, `Membuat folder Google Drive "${folderName}"...`);

  // 1. Create Folder
  const folderRes = await fetch('https://www.googleapis.com/drive/v3/files', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: folderName,
      mimeType: 'application/vnd.google-apps.folder',
    }),
  });

  if (!folderRes.ok) {
    const errorData = await folderRes.json().catch(() => ({}));
    throw new Error(
      errorData.error?.message || `Gagal membuat folder di Google Drive (${folderRes.status})`
    );
  }

  const folderData = await folderRes.json();
  const folderId = folderData.id;

  // 2. Upload each slide PNG inside the created folder using RFC multipart/related
  const boundary = 'CarouselXUploadBoundary' + Math.random().toString(36).substring(2);
  const startDelim = `--${boundary}\r\n`;
  const midDelim = `\r\n--${boundary}\r\n`;
  const closeDelim = `\r\n--${boundary}--`;

  for (let i = 0; i < slides.length; i++) {
    const { filename, blob } = slides[i];
    onProgress?.(
      i + 1,
      slides.length,
      `Mengunggah Slide ${i + 1} dari ${slides.length} (${filename})...`
    );

    const metadata = {
      name: filename,
      parents: [folderId],
      mimeType: 'image/png',
    };

    const multipartBlob = new Blob(
      [
        startDelim,
        'Content-Type: application/json; charset=UTF-8\r\n\r\n',
        JSON.stringify(metadata),
        midDelim,
        'Content-Type: image/png\r\n\r\n',
        blob,
        closeDelim,
      ],
      { type: `multipart/related; boundary=${boundary}` }
    );

    const uploadRes = await fetch(
      'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': `multipart/related; boundary=${boundary}`,
        },
        body: multipartBlob,
      }
    );

    if (!uploadRes.ok) {
      const err = await uploadRes.json().catch(() => ({}));
      throw new Error(
        err.error?.message || `Gagal mengunggah ${filename} ke Google Drive (${uploadRes.status})`
      );
    }
  }

  return {
    folderId,
    folderUrl: `https://drive.google.com/drive/folders/${folderId}`,
  };
}

/**
 * Creates or appends carousel slide copy & outline to Google Sheets
 */
export async function syncCarouselToGoogleSheets(
  token: string,
  topic: string,
  slides: Slide[],
  authorName: string
): Promise<{ spreadsheetUrl: string; spreadsheetId: string }> {
  const title = `CarouselX AI Plan - ${(topic || 'Untitled').slice(0, 35)}`;

  // 1. Create Spreadsheet
  const createRes = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      properties: {
        title,
      },
      sheets: [
        {
          properties: {
            title: 'Slides & Copy',
            gridProperties: {
              frozenRowCount: 1,
            },
          },
        },
      ],
    }),
  });

  if (!createRes.ok) {
    const err = await createRes.json().catch(() => ({}));
    throw new Error(
      err.error?.message || `Gagal membuat Google Sheet (${createRes.status})`
    );
  }

  const sheetData = await createRes.json();
  const spreadsheetId = sheetData.spreadsheetId;

  // 2. Prepare Rows Data
  const headers = [
    'Slide #',
    'Slide Type',
    'Headline / Title',
    'Body Text',
    'Bullets / Highlights',
    'Footer Hint / CTA',
    'Creator Handle',
    'Topic',
    'Generated At',
  ];

  const now = new Date().toLocaleString();
  const rows = slides.map((s, idx) => [
    `Slide ${idx + 1}`,
    s.type.toUpperCase(),
    s.title,
    s.body,
    s.points ? s.points.join(' | ') : '',
    s.footer_hint || '',
    authorName,
    topic,
    now,
  ]);

  // 3. Write rows to sheet
  const updateRes = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Slides%20&%20Copy!A1:I${rows.length + 1}?valueInputOption=USER_ENTERED`,
    {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        values: [headers, ...rows],
      }),
    }
  );

  if (!updateRes.ok) {
    const err = await updateRes.json().catch(() => ({}));
    throw new Error(
      err.error?.message || `Gagal menulis data ke Google Sheet (${updateRes.status})`
    );
  }

  return {
    spreadsheetId,
    spreadsheetUrl: `https://docs.google.com/spreadsheets/d/${spreadsheetId}`,
  };
}

/**
 * Extracts spreadsheet ID from full URL or returns raw ID
 */
export function extractSpreadsheetId(input: string): string {
  const match = input.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  return match ? match[1] : input.trim();
}

/**
 * Read topics from a Google Sheet (reads column A or first sheet)
 */
export async function readTopicsFromGoogleSheet(
  token: string,
  spreadsheetInput: string
): Promise<{ title: string; count?: number }[]> {
  const spreadsheetId = extractSpreadsheetId(spreadsheetInput);
  if (!spreadsheetId) {
    throw new Error('ID atau URL Google Sheets tidak valid');
  }

  const res = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/A1:B30`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(
      err.error?.message || 'Tidak dapat membaca Google Sheet. Pastikan Anda memiliki akses izin baca.'
    );
  }

  const data = await res.json();
  const values = data.values as string[][] | undefined;

  if (!values || values.length === 0) {
    return [];
  }

  // Filter out headers or empty rows
  const topics: { title: string; count?: number }[] = [];
  for (let i = 0; i < values.length; i++) {
    const row = values[i];
    const text = row[0]?.trim();
    if (!text || (i === 0 && (text.toLowerCase().includes('topic') || text.toLowerCase().includes('judul')))) {
      continue;
    }
    const countVal = row[1] ? parseInt(row[1], 10) : undefined;
    topics.push({
      title: text,
      count: !isNaN(countVal as number) ? countVal : undefined,
    });
  }

  return topics;
}

/**
 * Extracts presentation ID from full Google Slides URL or returns raw ID
 */
export function extractPresentationId(input: string): string {
  const match = input.match(/\/presentation\/d\/([a-zA-Z0-9-_]+)/);
  return match ? match[1] : input.trim();
}

/**
 * Export Carousel directly to a Google Slides Presentation Deck
 */
export async function exportToGoogleSlides(
  token: string,
  topic: string,
  slides: Slide[],
  authorName: string,
  authorHandle: string,
  onProgress?: (current: number, total: number, message: string) => void
): Promise<{ presentationId: string; presentationUrl: string }> {
  const deckTitle = `CarouselX Deck - ${(topic || 'Presentation').slice(0, 45)} (${authorName || 'Arijal Meutuwah'})`;

  onProgress?.(0, slides.length, 'Membuat presentasi Google Slides baru...');

  // 1. Create the Presentation
  const createRes = await fetch('https://slides.googleapis.com/v1/presentations', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      title: deckTitle,
    }),
  });

  if (!createRes.ok) {
    const err = await createRes.json().catch(() => ({}));
    throw new Error(
      err.error?.message || `Gagal membuat presentasi Google Slides (${createRes.status})`
    );
  }

  const presentation = await createRes.json();
  const presentationId = presentation.presentationId;
  const initialSlideId = presentation.slides?.[0]?.objectId;

  onProgress?.(1, slides.length, 'Menyusun layout, tema, dan kartu slide...');

  // 2. Build BatchUpdate Requests for styled slides
  const requests: any[] = [];
  const timestamp = Date.now();

  slides.forEach((slide, idx) => {
    const pageId = `page_${timestamp}_${idx}`;
    const badgeShapeId = `badge_${timestamp}_${idx}`;
    const titleShapeId = `title_${timestamp}_${idx}`;
    const bodyShapeId = `body_${timestamp}_${idx}`;
    const bulletShapeId = `bullets_${timestamp}_${idx}`;
    const footerShapeId = `footer_${timestamp}_${idx}`;
    const codeShapeId = `code_${timestamp}_${idx}`;

    // 2.1 Create Blank Slide
    requests.push({
      createSlide: {
        objectId: pageId,
        slideLayoutReference: {
          predefinedLayout: 'BLANK',
        },
      },
    });

    // 2.2 Set Slide Background Color (Sophisticated dark theme #0B0F19)
    requests.push({
      updatePageProperties: {
        objectId: pageId,
        fields: 'pageProperties.pageBackgroundFill',
        pageProperties: {
          pageBackgroundFill: {
            solidFill: {
              color: {
                rgbColor: {
                  red: 0.043,
                  green: 0.059,
                  blue: 0.098,
                },
              },
            },
          },
        },
      },
    });

    // 2.3 Category / Step Badge Shape
    const badgeText = (
      slide.badge ||
      slide.stepBadge ||
      (slide.type === 'hook'
        ? '🔥 HOOK STRATEGY'
        : slide.type === 'cta'
        ? '🚀 ACTION SUMMARY'
        : `SLIDE ${idx + 1}`)
    ).toUpperCase();

    requests.push({
      createShape: {
        objectId: badgeShapeId,
        shapeType: 'ROUNDED_RECTANGLE',
        elementProperties: {
          pageObjectId: pageId,
          size: {
            width: { magnitude: 240, unit: 'PT' },
            height: { magnitude: 22, unit: 'PT' },
          },
          transform: {
            scaleX: 1,
            scaleY: 1,
            translateX: 40,
            translateY: 28,
            unit: 'PT',
          },
        },
      },
    });
    requests.push({
      updateShapeProperties: {
        objectId: badgeShapeId,
        fields: 'shapeBackgroundFill.solidFill.color,outline',
        shapeProperties: {
          shapeBackgroundFill: {
            solidFill: {
              color: {
                rgbColor: { red: 0.12, green: 0.18, blue: 0.32 },
              },
            },
          },
          outline: {
            outlineFill: {
              solidFill: {
                color: { rgbColor: { red: 0.25, green: 0.45, blue: 0.95 } },
              },
            },
            weight: { magnitude: 1, unit: 'PT' },
          },
        },
      },
    });
    requests.push({
      insertText: {
        objectId: badgeShapeId,
        text: ` ${badgeText} `,
        insertionIndex: 0,
      },
    });
    requests.push({
      updateTextStyle: {
        objectId: badgeShapeId,
        fields: 'foregroundColor,bold,fontSize,fontFamily',
        style: {
          bold: true,
          fontSize: { magnitude: 9, unit: 'PT' },
          fontFamily: 'Roboto',
          foregroundColor: {
            opaqueColor: {
              rgbColor: { red: 0.58, green: 0.77, blue: 1.0 },
            },
          },
        },
      },
    });

    // 2.4 Title / Headline Shape
    requests.push({
      createShape: {
        objectId: titleShapeId,
        shapeType: 'TEXT_BOX',
        elementProperties: {
          pageObjectId: pageId,
          size: {
            width: { magnitude: 640, unit: 'PT' },
            height: { magnitude: 55, unit: 'PT' },
          },
          transform: {
            scaleX: 1,
            scaleY: 1,
            translateX: 40,
            translateY: 58,
            unit: 'PT',
          },
        },
      },
    });
    requests.push({
      insertText: {
        objectId: titleShapeId,
        text: slide.title || 'Slide Title',
        insertionIndex: 0,
      },
    });
    requests.push({
      updateTextStyle: {
        objectId: titleShapeId,
        fields: 'foregroundColor,bold,fontSize,fontFamily',
        style: {
          bold: true,
          fontSize: { magnitude: 20, unit: 'PT' },
          fontFamily: 'Montserrat',
          foregroundColor: {
            opaqueColor: {
              rgbColor: { red: 0.98, green: 0.98, blue: 1.0 },
            },
          },
        },
      },
    });

    // 2.5 Body Text Shape
    if (slide.body) {
      requests.push({
        createShape: {
          objectId: bodyShapeId,
          shapeType: 'TEXT_BOX',
          elementProperties: {
            pageObjectId: pageId,
            size: {
              width: { magnitude: 640, unit: 'PT' },
              height: { magnitude: slide.points?.length ? 65 : 170, unit: 'PT' },
            },
            transform: {
              scaleX: 1,
              scaleY: 1,
              translateX: 40,
              translateY: 120,
              unit: 'PT',
            },
          },
        },
      });
      requests.push({
        insertText: {
          objectId: bodyShapeId,
          text: slide.body,
          insertionIndex: 0,
        },
      });
      requests.push({
        updateTextStyle: {
          objectId: bodyShapeId,
          fields: 'foregroundColor,fontSize,fontFamily',
          style: {
            fontSize: { magnitude: 13, unit: 'PT' },
            fontFamily: 'Roboto',
            foregroundColor: {
              opaqueColor: {
                rgbColor: { red: 0.82, green: 0.85, blue: 0.92 },
              },
            },
          },
        },
      });
    }

    // 2.6 Bullets / Key Points Shape
    if (slide.points && slide.points.length > 0) {
      const bulletsText = slide.points.map((p) => `✔  ${p}`).join('\n');
      const startY = slide.body ? 195 : 125;
      requests.push({
        createShape: {
          objectId: bulletShapeId,
          shapeType: 'TEXT_BOX',
          elementProperties: {
            pageObjectId: pageId,
            size: {
              width: { magnitude: 640, unit: 'PT' },
              height: { magnitude: 130, unit: 'PT' },
            },
            transform: {
              scaleX: 1,
              scaleY: 1,
              translateX: 40,
              translateY: startY,
              unit: 'PT',
            },
          },
        },
      });
      requests.push({
        insertText: {
          objectId: bulletShapeId,
          text: bulletsText,
          insertionIndex: 0,
        },
      });
      requests.push({
        updateTextStyle: {
          objectId: bulletShapeId,
          fields: 'foregroundColor,fontSize,fontFamily',
          style: {
            fontSize: { magnitude: 12, unit: 'PT' },
            fontFamily: 'Roboto',
            foregroundColor: {
              opaqueColor: {
                rgbColor: { red: 0.72, green: 0.92, blue: 0.78 },
              },
            },
          },
        },
      });
    }

    // 2.7 Code Snippet / Terminal Box if present
    if (slide.codeSnippet) {
      requests.push({
        createShape: {
          objectId: codeShapeId,
          shapeType: 'RECTANGLE',
          elementProperties: {
            pageObjectId: pageId,
            size: {
              width: { magnitude: 640, unit: 'PT' },
              height: { magnitude: 65, unit: 'PT' },
            },
            transform: {
              scaleX: 1,
              scaleY: 1,
              translateX: 40,
              translateY: 285,
              unit: 'PT',
            },
          },
        },
      });
      requests.push({
        updateShapeProperties: {
          objectId: codeShapeId,
          fields: 'shapeBackgroundFill.solidFill.color,outline',
          shapeProperties: {
            shapeBackgroundFill: {
              solidFill: {
                color: { rgbColor: { red: 0.08, green: 0.08, blue: 0.12 } },
              },
            },
            outline: {
              outlineFill: {
                solidFill: {
                  color: { rgbColor: { red: 0.22, green: 0.22, blue: 0.3 } },
                },
              },
              weight: { magnitude: 1, unit: 'PT' },
            },
          },
        },
      });
      requests.push({
        insertText: {
          objectId: codeShapeId,
          text: slide.codeSnippet,
          insertionIndex: 0,
        },
      });
      requests.push({
        updateTextStyle: {
          objectId: codeShapeId,
          fields: 'foregroundColor,fontSize,fontFamily',
          style: {
            fontSize: { magnitude: 11, unit: 'PT' },
            fontFamily: 'Consolas',
            foregroundColor: {
              opaqueColor: {
                rgbColor: { red: 0.4, green: 0.9, blue: 0.5 },
              },
            },
          },
        },
      });
    }

    // 2.8 Creator Watermark Footer
    const footerText = `${authorName || 'Arijal Meutuwah'} • ${authorHandle || '@abangjal'}   |   Slide ${idx + 1} of ${slides.length}   |   ${slide.footer_hint || 'Swipe 👉'}`;
    requests.push({
      createShape: {
        objectId: footerShapeId,
        shapeType: 'TEXT_BOX',
        elementProperties: {
          pageObjectId: pageId,
          size: {
            width: { magnitude: 640, unit: 'PT' },
            height: { magnitude: 25, unit: 'PT' },
          },
          transform: {
            scaleX: 1,
            scaleY: 1,
            translateX: 40,
            translateY: 360,
            unit: 'PT',
          },
        },
      },
    });
    requests.push({
      insertText: {
        objectId: footerShapeId,
        text: footerText,
        insertionIndex: 0,
      },
    });
    requests.push({
      updateTextStyle: {
        objectId: footerShapeId,
        fields: 'foregroundColor,fontSize,fontFamily',
        style: {
          fontSize: { magnitude: 10, unit: 'PT' },
          fontFamily: 'Roboto',
          foregroundColor: {
            opaqueColor: {
              rgbColor: { red: 0.5, green: 0.55, blue: 0.65 },
            },
          },
        },
      },
    });
  });

  // 2.9 Delete the original initial blank slide
  if (initialSlideId) {
    requests.push({
      deleteObject: {
        objectId: initialSlideId,
      },
    });
  }

  // 3. Execute batch update
  onProgress?.(slides.length, slides.length, 'Menerapkan format visual ke Google Slides...');

  const batchRes = await fetch(
    `https://slides.googleapis.com/v1/presentations/${presentationId}:batchUpdate`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        requests,
      }),
    }
  );

  if (!batchRes.ok) {
    const err = await batchRes.json().catch(() => ({}));
    throw new Error(
      err.error?.message || `Gagal memformat Google Slides (${batchRes.status})`
    );
  }

  return {
    presentationId,
    presentationUrl: `https://docs.google.com/presentation/d/${presentationId}/edit`,
  };
}

/**
 * Reads and imports slides from an existing Google Slides presentation
 */
export async function readSlidesFromGooglePresentation(
  token: string,
  presentationInput: string
): Promise<{ topic: string; slides: Slide[] }> {
  const presentationId = extractPresentationId(presentationInput);
  if (!presentationId) {
    throw new Error('ID atau URL Google Slides tidak valid');
  }

  const res = await fetch(`https://slides.googleapis.com/v1/presentations/${presentationId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(
      err.error?.message || 'Tidak dapat membaca Google Slides. Pastikan Anda memiliki akses izin baca.'
    );
  }

  const data = await res.json();
  const deckTitle = data.title || 'Google Slides Import';
  const rawSlides = data.slides || [];

  if (rawSlides.length === 0) {
    throw new Error('Presentasi Google Slides ini tidak memiliki slide.');
  }

  const parsedSlides: Slide[] = [];

  rawSlides.forEach((slideObj: any, idx: number) => {
    const pageElements = slideObj.pageElements || [];
    const textPieces: string[] = [];

    pageElements.forEach((el: any) => {
      const textEl = el.shape?.text?.textElements;
      if (textEl && Array.isArray(textEl)) {
        const fullShapeText = textEl
          .map((t: any) => t.textRun?.content || '')
          .join('')
          .trim();
        if (fullShapeText) {
          textPieces.push(fullShapeText);
        }
      }
    });

    let title = textPieces[0] || `Slide ${idx + 1}`;
    let body = textPieces.slice(1).join('\n\n') || 'Konten slide Google Slides.';
    const points: string[] = [];

    // Extract bullet items if lines start with -, *, •, or ✔
    const lines = body.split('\n');
    const remainingLines: string[] = [];
    lines.forEach((line) => {
      const trimmed = line.trim();
      if (/^[•*✔\-\d+\.]\s+/.test(trimmed)) {
        points.push(trimmed.replace(/^[•*✔\-\d+\.]\s+/, ''));
      } else {
        remainingLines.push(line);
      }
    });

    if (points.length > 0) {
      body = remainingLines.join('\n').trim();
    }

    const type = idx === 0 ? 'hook' : idx === rawSlides.length - 1 ? 'cta' : 'content';

    parsedSlides.push({
      id: `imported-slide-${Date.now()}-${idx}`,
      slide_number: idx + 1,
      type,
      title: title.slice(0, 100),
      body: body.slice(0, 400),
      points: points.length > 0 ? points.slice(0, 5) : undefined,
      badge: idx === 0 ? 'PANDUAN' : `BAGIAN ${idx + 1}`,
      footer_hint: idx === rawSlides.length - 1 ? 'Simpan & Bagikan' : 'Geser 👉',
    });
  });

  return {
    topic: deckTitle.replace(/^CarouselX Deck\s*-\s*/, ''),
    slides: parsedSlides,
  };
}

