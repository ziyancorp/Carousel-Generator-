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
    console.error('Google sign in error:', error);
    throw error;
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
  const boundary = '-------CarouselXUploadBoundary314159265';
  const delimiter = '\r\n--' + boundary + '\r\n';
  const closeDelim = '\r\n--' + boundary + '--';

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
        delimiter,
        'Content-Type: application/json; charset=UTF-8\r\n\r\n',
        JSON.stringify(metadata),
        delimiter,
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

