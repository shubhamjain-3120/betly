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
    console.log('🔍 Checking if couple can accept new member for code:', coupleCode);
    
    // Check if couple exists
    const { data: couples, error: coupleError } = await supabase
      .from('couples')
      .select('id')
      .eq('couple_code', coupleCode);

    if (coupleError) {
      console.error('❌ Error checking couple existence:', coupleError);
      return false;
    }

    if (!couples || couples.length === 0) {
      console.log('❌ Couple not found with code:', coupleCode);
      return false;
    }

    const couple = couples[0];
    console.log('✅ Couple found:', couple.id);

    // Check how many PAIRED members the couple has
    console.log('🔍 Checking paired member count for couple:', couple.id);
    const { data: pairedMembers, error: membersError } = await supabase
      .from('users')
      .select('id')
      .eq('couple_id', couple.id)
      .eq('is_paired', true);

    if (membersError) {
      console.error('❌ Error checking paired members:', membersError);
      return false;
    }

    console.log('📊 Paired member count:', pairedMembers.length);
    
    // Couple can accept new member if it has 0 or 1 paired members
    // 0 = no one is paired yet (both unlinked)
    // 1 = one person is paired, waiting for partner
    const canJoin = pairedMembers.length <= 1;
    console.log('✅ Can join couple:', canJoin);
    return canJoin;
  } catch (error) {
    console.error('❌ Error checking if couple can join:', error);
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

// Check if user can rejoin their existing couple
export const canRejoinCouple = async (coupleCode: string, userAuthToken: string): Promise<boolean> => {
  try {
    console.log('🔍 Checking if user can rejoin couple:', coupleCode);
    
    // Check if couple exists
    const couple = await getCoupleByCode(coupleCode);
    if (!couple) {
      console.log('❌ Couple not found');
      return false;
    }

    // Check if user is already in this couple
    const { data: existingUser, error: userError } = await supabase
      .from('users')
      .select('id, is_paired')
      .eq('couple_id', couple.id)
      .eq('auth_token', userAuthToken);

    if (userError) {
      console.error('❌ Error checking existing user:', userError);
      return false;
    }

    if (!existingUser || existingUser.length === 0) {
      console.log('❌ User not found in couple');
      return false;
    }

    console.log('✅ User found in couple, is_paired:', existingUser[0].is_paired);
    
    // User can rejoin if they're in the couple but not currently paired
    return !existingUser[0].is_paired;
  } catch (error) {
    console.error('❌ Error checking if user can rejoin:', error);
    return false;
  }
};
