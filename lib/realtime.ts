import { supabase, getCurrentCoupleId } from './supabase';
import { Bet } from './supabase';
import { getCurrentUser } from './auth';

export interface RealtimeSubscription {
  unsubscribe: () => void;
}

export interface RealtimeCallbacks {
  onBetInsert?: (bet: Bet) => void;
  onBetUpdate?: (bet: Bet) => void;
  onBetDelete?: (betId: string) => void;
}

// Helper function to validate realtime setup
export const validateRealtimeSetup = async (): Promise<boolean> => {
  try {
    console.log('🔍 Validating realtime setup...');
    
    // Check if user is authenticated
    const user = await getCurrentUser();
    if (!user) {
      console.error('❌ No authenticated user found');
      return false;
    }
    
    console.log('✅ User authenticated:', user.name, user.id);
    
    // Check if user has a couple
    if (!user.couple_id) {
      console.error('❌ User has no couple_id');
      return false;
    }
    
    console.log('✅ User has couple_id:', user.couple_id);
    
    // Check if user is paired
    if (!user.is_paired) {
      console.warn('⚠️ User is not paired - realtime may not work properly');
    } else {
      console.log('✅ User is paired with partner:', user.partner_id);
    }
    
    return true;
  } catch (error) {
    console.error('❌ Error validating realtime setup:', error);
    return false;
  }
};

/**
 * Subscribe to real-time changes for bets in the current couple
 */
export const subscribeToBets = async (callbacks: RealtimeCallbacks): Promise<RealtimeSubscription> => {
  try {
    // Validate setup first
    const isValid = await validateRealtimeSetup();
    if (!isValid) {
      throw new Error('Realtime setup validation failed');
    }
    
    const coupleId = await getCurrentCoupleId();
    if (!coupleId) {
      console.error('❌ No couple ID found for real-time subscription');
      console.error('❌ This usually means the user is not properly authenticated or not in a couple');
      throw new Error('No couple ID found');
    }

    console.log('🔔 Setting up real-time subscription for couple:', coupleId);

    const subscription = supabase
      .channel('bets-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'bets',
          filter: `couple_id=eq.${coupleId}`,
        },
        (payload) => {
          console.log('🔔 Real-time update received:', payload);
          
          switch (payload.eventType) {
            case 'INSERT':
              if (callbacks.onBetInsert && payload.new) {
                callbacks.onBetInsert(payload.new as Bet);
              }
              break;
            case 'UPDATE':
              if (callbacks.onBetUpdate && payload.new) {
                callbacks.onBetUpdate(payload.new as Bet);
              }
              break;
            case 'DELETE':
              if (callbacks.onBetDelete && payload.old) {
                callbacks.onBetDelete((payload.old as Bet).id);
              }
              break;
          }
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('✅ Real-time subscription active');
        } else if (status === 'CHANNEL_ERROR') {
          console.error('❌ Real-time subscription error');
        } else if (status === 'TIMED_OUT') {
          console.warn('⏰ Real-time subscription timed out');
        }
      });

    return {
      unsubscribe: () => {
        console.log('🔕 Unsubscribing from real-time updates');
        subscription.unsubscribe();
      }
    };
  } catch (error) {
    console.error('❌ Error setting up real-time subscription:', error);
    throw error;
  }
};

/**
 * Subscribe to real-time changes for active bets only
 */
export const subscribeToActiveBets = async (callbacks: RealtimeCallbacks): Promise<RealtimeSubscription> => {
  try {
    // Validate setup first
    const isValid = await validateRealtimeSetup();
    if (!isValid) {
      throw new Error('Realtime setup validation failed');
    }
    
    const coupleId = await getCurrentCoupleId();
    if (!coupleId) {
      console.error('❌ No couple ID found for active bets subscription');
      console.error('❌ This usually means the user is not properly authenticated or not in a couple');
      throw new Error('No couple ID found');
    }

    console.log('🔔 Setting up real-time subscription for active bets, couple:', coupleId);

    const subscription = supabase
      .channel('active-bets-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'bets',
          filter: `couple_id=eq.${coupleId},status=eq.active`,
        },
        (payload) => {
          console.log('🔔 Active bet update received:', payload);
          
          switch (payload.eventType) {
            case 'INSERT':
              if (callbacks.onBetInsert && payload.new) {
                callbacks.onBetInsert(payload.new as Bet);
              }
              break;
            case 'UPDATE':
              if (callbacks.onBetUpdate && payload.new) {
                callbacks.onBetUpdate(payload.new as Bet);
              }
              break;
            case 'DELETE':
              if (callbacks.onBetDelete && payload.old) {
                callbacks.onBetDelete((payload.old as Bet).id);
              }
              break;
          }
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('✅ Active bets real-time subscription active');
        } else if (status === 'CHANNEL_ERROR') {
          console.error('❌ Active bets real-time subscription error');
        } else if (status === 'TIMED_OUT') {
          console.warn('⏰ Active bets real-time subscription timed out');
        }
      });

    return {
      unsubscribe: () => {
        console.log('🔕 Unsubscribing from active bets real-time updates');
        subscription.unsubscribe();
      }
    };
  } catch (error) {
    console.error('❌ Error setting up active bets real-time subscription:', error);
    throw error;
  }
};

/**
 * Subscribe to real-time changes for concluded bets only
 */
export const subscribeToConcludedBets = async (callbacks: RealtimeCallbacks): Promise<RealtimeSubscription> => {
  try {
    // Validate setup first
    const isValid = await validateRealtimeSetup();
    if (!isValid) {
      throw new Error('Realtime setup validation failed');
    }
    
    const coupleId = await getCurrentCoupleId();
    if (!coupleId) {
      console.error('❌ No couple ID found for concluded bets subscription');
      console.error('❌ This usually means the user is not properly authenticated or not in a couple');
      throw new Error('No couple ID found');
    }

    console.log('🔔 Setting up real-time subscription for concluded bets, couple:', coupleId);

    const subscription = supabase
      .channel('concluded-bets-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'bets',
          filter: `couple_id=eq.${coupleId},status=eq.concluded`,
        },
        (payload) => {
          console.log('🔔 Concluded bet update received:', payload);
          
          switch (payload.eventType) {
            case 'INSERT':
              if (callbacks.onBetInsert && payload.new) {
                callbacks.onBetInsert(payload.new as Bet);
              }
              break;
            case 'UPDATE':
              if (callbacks.onBetUpdate && payload.new) {
                callbacks.onBetUpdate(payload.new as Bet);
              }
              break;
            case 'DELETE':
              if (callbacks.onBetDelete && payload.old) {
                callbacks.onBetDelete((payload.old as Bet).id);
              }
              break;
          }
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('✅ Concluded bets real-time subscription active');
        } else if (status === 'CHANNEL_ERROR') {
          console.error('❌ Concluded bets real-time subscription error');
        } else if (status === 'TIMED_OUT') {
          console.warn('⏰ Concluded bets real-time subscription timed out');
        }
      });

    return {
      unsubscribe: () => {
        console.log('🔕 Unsubscribing from concluded bets real-time updates');
        subscription.unsubscribe();
      }
    };
  } catch (error) {
    console.error('❌ Error setting up concluded bets real-time subscription:', error);
    throw error;
  }
};
