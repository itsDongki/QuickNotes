import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { updateUser } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Generate a unique URL for the user's profile picture
    // In a production app, you would upload to Cloudinary or another service here
    const imageUrl = `https://api.dicebear.com/7.x/initials/svg?seed=${session.user.email}&background=random`;

    // Update the user's profile in the database
    const updatedUser = await updateUser(session.user.id, { image: imageUrl });
    
    if (!updatedUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ 
      success: true, 
      imageUrl: updatedUser.image 
    });

  } catch (error) {
    console.error('Error uploading profile picture:', error);
    return NextResponse.json(
      { error: 'Failed to upload profile picture' },
      { status: 500 }
    );
  }
}
