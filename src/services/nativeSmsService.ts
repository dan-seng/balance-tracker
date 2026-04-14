import { NativeEventEmitter, NativeModules, EmitterSubscription } from 'react-native';

const { SmsModule } = NativeModules;

type SmsEventData = {
  sender: string;
  message: string;
  timestamp: number;
};

type SmsListener = (data: SmsEventData) => void;

class NativeSmsService {
  private eventEmitter: NativeEventEmitter | null = null;
  private subscriptions: Map<SmsListener, EmitterSubscription> = new Map();

  constructor() {
    if (SmsModule) {
      this.eventEmitter = new NativeEventEmitter(SmsModule);
    }
  }

  addListener(listener: SmsListener) {
    if (!this.eventEmitter) {
      console.warn('SmsModule not available');
      return;
    }

    if (this.subscriptions.has(listener)) {
      return;
    }

    const subscription = this.eventEmitter.addListener('onSmsReceived', (data: SmsEventData) => {
      console.log('SMS Event received:', data);
      listener(data);
    });
    this.subscriptions.set(listener, subscription);
  }

  removeListener(listener: SmsListener) {
    const subscription = this.subscriptions.get(listener);
    if (subscription) {
      subscription.remove();
      this.subscriptions.delete(listener);
    }
  }

  removeAllListeners() {
    this.subscriptions.forEach(subscription => {
      subscription.remove();
    });
    this.subscriptions.clear();
  }
}

export const nativeSmsService = new NativeSmsService();
