import { supabase } from './supabase';

// Generate a unique 6-character couple code
export const generateCoupleCode = async (): Promise<string> => {
  console.log('🎲 Starting couple code generation...');
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code: string;
  let attempts = 0;
  const maxAttempts = 10;

  do {
    code = '';
    for (let i = 0; i < 6; i++) {
      code += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    attempts++;
    console.log(`🔍 Attempt ${attempts}: Generated code "${code}", checking if exists...`);
  } while (await isCoupleCodeExists(code) && attempts < maxAttempts);

  if (attempts >= maxAttempts) {
    console.error('❌ Failed to generate unique couple code after', maxAttempts, 'attempts');
    throw new Error('Unable to generate unique couple code');
  }

  console.log(`✅ Unique couple code generated: "${code}" (took ${attempts} attempts)`);
  return code;
};

// Check if couple code already exists
export const isCoupleCodeExists = async (code: string): Promise<boolean> => {
  try {
    console.log(`🔍 Checking if couple code "${code}" exists...`);
    const { data, error } = await supabase
      .from('couples')
      .select('id')
      .eq('couple_code', code);

    if (error) {
      console.error('❌ Error checking couple code:', error);
      throw error;
    }

    const exists = data && data.length > 0;
    console.log(`📊 Couple code "${code}" exists:`, exists);
    return exists;
  } catch (error) {
    console.error('❌ Error checking couple code:', error);
    return true; // Assume exists on error to be safe
  }
};

// Validate couple code format
export const isValidCoupleCode = (code: string): boolean => {
  return /^[A-Z0-9]{6}$/.test(code);
};

// Check if couple can accept new member
export const canJoinCouple = async (coupleCode: string): Promise<boolean> => {
  try {
    // Check if couple exists
    const { data: couples, error: coupleError } = await supabase
      .from('couples')
      .select('id')
      .eq('couple_code', coupleCode);

    if (coupleError || !couples || couples.length === 0) {
      return false;
    }

    const couple = couples[0];

    // Check how many members the couple has
    const { data: members, error: membersError } = await supabase
      .from('users')
      .select('id')
      .eq('couple_id', couple.id);

    if (membersError) {
      return false;
    }

    // Couple can only have 1 member (waiting for partner)
    return members.length === 1;
  } catch (error) {
    console.error('Error checking if couple can join:', error);
    return false;
  }
};

// Get couple by code
export const getCoupleByCode = async (coupleCode: string) => {
  try {
    const { data, error } = await supabase
      .from('couples')
      .select('id, couple_code, created_at')
      .eq('couple_code', coupleCode);

    if (error) {
      throw error;
    }

    return data && data.length > 0 ? data[0] : null;
  } catch (error) {
    console.error('Error getting couple by code:', error);
    return null;
  }
};
