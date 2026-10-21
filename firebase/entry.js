// Point d'entrée du SDK Firebase embarqué dans l'app (regroupé dans firebase-sdk.js par
// scripts/build-firebase.js). Embarqué plutôt que chargé depuis internet: l'app marche hors ligne.
import { initializeApp, deleteApp } from 'firebase/app';
import {
    initializeAuth, indexedDBLocalPersistence, browserLocalPersistence, inMemoryPersistence,
    signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged,
    updatePassword, reauthenticateWithCredential, EmailAuthProvider,
} from 'firebase/auth';
import {
    initializeFirestore, doc, collection, getDoc, getDocs, setDoc, updateDoc, deleteDoc,
    runTransaction, onSnapshot,
} from 'firebase/firestore';

window.FB = {
    initializeApp, deleteApp,
    initializeAuth, indexedDBLocalPersistence, browserLocalPersistence, inMemoryPersistence,
    signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged,
    updatePassword, reauthenticateWithCredential, EmailAuthProvider,
    initializeFirestore, doc, collection, getDoc, getDocs, setDoc, updateDoc, deleteDoc,
    runTransaction, onSnapshot,
};
