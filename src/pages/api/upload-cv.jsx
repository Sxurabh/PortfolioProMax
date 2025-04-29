import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import formidable from 'formidable';
import fs from 'fs';
import path from 'path';

// Disable Next.js body parser to handle multipart/form-data
export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);

  // Check if the user is an admin
  if (!session || session.user.email !== process.env.NEXT_PUBLIC_ADMIN_EMAIL) {
    return res.status(403).json({ error: 'Unauthorized' });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Use the new formidable API
  const form = formidable({
    uploadDir: path.join(process.cwd(), 'public'),
    keepExtensions: true,
    multiples: false, // Only allow one file
    filter: ({ mimetype }) => mimetype && mimetype.includes('pdf'), // Only allow PDFs
  });

  try {
    const [fields, files] = await form.parse(req);
    const file = files.cv?.[0]; // The name of the file input field

    if (!file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Rename the uploaded file to 'cv.pdf' and overwrite the existing one
    const newPath = path.join(process.cwd(), 'public', 'cv.pdf');
    fs.renameSync(file.filepath, newPath);

    res.status(200).json({ message: 'CV uploaded successfully', url: '/cv.pdf' });
  } catch (error) {
    console.error('Error uploading file:', error);
    res.status(500).json({ error: 'Error uploading file' });
  }
}