export interface EcommerceRow {
  id: number;
  orderId: string;
  customerId: string;
  email: string;
  productName: string;
  quantity: number;
  price: number;
  orderDate: string;
  status: string;
}

export interface Alert {
  id: string;
  timestamp: Date;
  severity: 'critical' | 'warning' | 'info';
  type: string;
  message: string;
  column: string;
  affectedRows: number;
}

const DB_NAME = 'DataQualityGuardDB';
const DB_VERSION = 1;
const STORE_DATASET = 'dataset';
const STORE_ALERTS = 'alerts';

class MockDataService {
  private db: IDBDatabase | null = null;

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        if (!db.objectStoreNames.contains(STORE_DATASET)) {
          db.createObjectStore(STORE_DATASET, { keyPath: 'id' });
        }

        if (!db.objectStoreNames.contains(STORE_ALERTS)) {
          const alertStore = db.createObjectStore(STORE_ALERTS, { keyPath: 'id' });
          alertStore.createIndex('timestamp', 'timestamp', { unique: false });
        }
      };
    });
  }

  async seedDemoData(): Promise<void> {
    const data = this.generateDemoData();
    await this.clearDataset();
    
    const transaction = this.db!.transaction([STORE_DATASET], 'readwrite');
    const store = transaction.objectStore(STORE_DATASET);

    for (const row of data) {
      store.add(row);
    }

    return new Promise((resolve, reject) => {
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    });
  }

  private generateDemoData(): EcommerceRow[] {
    const products = [
      'Laptop Pro X1', 'Wireless Mouse', 'USB-C Cable', 'Monitor 27"',
      'Mechanical Keyboard', 'Desk Lamp', 'Webcam HD', 'Headphones',
    ];
    const statuses = ['completed', 'pending', 'shipped', 'cancelled'];
    const data: EcommerceRow[] = [];

    for (let i = 0; i < 100; i++) {
      const basePrice = Math.random() * 500 + 50;
      let price = basePrice;
      let email = `customer${i}@example.com`;
      let orderId = `ORD-${1000 + i}`;

      if (i === 15) {
        email = '';
      }

      if (i === 42) {
        orderId = 'ORD-1025';
      }

      if (i === 87) {
        price = 50000;
      }

      data.push({
        id: i,
        orderId,
        customerId: `CUST-${2000 + i}`,
        email,
        productName: products[Math.floor(Math.random() * products.length)],
        quantity: Math.floor(Math.random() * 5) + 1,
        price: parseFloat(price.toFixed(2)),
        orderDate: new Date(2024, 0, 1 + Math.floor(Math.random() * 365)).toISOString(),
        status: statuses[Math.floor(Math.random() * statuses.length)],
      });
    }

    return data;
  }

  async getDataset(): Promise<EcommerceRow[]> {
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_DATASET], 'readonly');
      const store = transaction.objectStore(STORE_DATASET);
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async clearDataset(): Promise<void> {
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_DATASET], 'readwrite');
      const store = transaction.objectStore(STORE_DATASET);
      const request = store.clear();

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async addAlert(alert: Omit<Alert, 'id'>): Promise<void> {
    const fullAlert: Alert = {
      ...alert,
      id: `alert-${Date.now()}-${Math.random()}`,
    };

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_ALERTS], 'readwrite');
      const store = transaction.objectStore(STORE_ALERTS);
      const request = store.add(fullAlert);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getAlerts(): Promise<Alert[]> {
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_ALERTS], 'readonly');
      const store = transaction.objectStore(STORE_ALERTS);
      const request = store.getAll();

      request.onsuccess = () => {
        const alerts = request.result;
        alerts.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        resolve(alerts);
      };
      request.onerror = () => reject(request.error);
    });
  }

  async clearAlerts(): Promise<void> {
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_ALERTS], 'readwrite');
      const store = transaction.objectStore(STORE_ALERTS);
      const request = store.clear();

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }
}

export const dataService = new MockDataService();