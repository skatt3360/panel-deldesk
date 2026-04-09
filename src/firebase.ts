import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: 'AIzaSyCuCXGLol577LdJBFzkNWky27eDJdaBF0w',
  authDomain: 'panel-helpdesk-ed3f1.firebaseapp.com',
  databaseURL: 'https://panel-helpdesk-ed3f1-default-rtdb.europe-west1.firebasedatabase.app',
  projectId: 'panel-helpdesk-ed3f1',
  storageBucket: 'panel-helpdesk-ed3f1.firebasestorage.app',
  messagingSenderId: '384650483840',
  appId: '1:384650483840:web:7a8db9ea172423046aee65',
  measurementId: 'G-4CH63EKLVH',
};

const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);
export const auth = getAuth(app);
export default app;
