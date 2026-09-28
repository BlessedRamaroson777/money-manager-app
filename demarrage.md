Application mobile
npm run apk
(copie la page et les données à jour du PC dans l'APK, puis génère android/app/build/outputs/apk/debug/BlessedMoney.apk)
Installer l'APK PAR-DESSUS l'app existante, sans la désinstaller.
npm run apk:testeurs
(Génère un APK pour les testeurs, sans données personnelles ni adresse du PC)

npx cap sync android
cmd /c "cd android && gradlew.bat assembleDebug"

Application web
npm start
Ouvrir http://localhost:3000 (connexion par défaut: blessed / blessed)

Synchro téléphone <-> PC
Le téléphone se synchronise tout seul (à l'ouverture et après chaque ajout) quand le PC est allumé
et sur le même Wi-Fi. Bouton "Synchroniser" en haut de l'app pour forcer.
