package com.blessed.portemonnaie.dev;

import android.os.Bundle;

import androidx.activity.OnBackPressedCallback;

import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        // Bouton retour: la page décide (fermer une fenêtre, revenir à la page précédente...).
        // Si elle n'a rien à faire (déjà sur l'accueil), l'app se met en arrière-plan comme d'habitude.
        getOnBackPressedDispatcher().addCallback(this, new OnBackPressedCallback(true) {
            @Override
            public void handleOnBackPressed() {
                if (getBridge() == null || getBridge().getWebView() == null) {
                    moveTaskToBack(true);
                    return;
                }
                getBridge().getWebView().evaluateJavascript(
                    "(window.blessedBack && window.blessedBack()) ? 'handled' : 'exit'",
                    value -> {
                        if (value == null || !value.contains("handled")) moveTaskToBack(true);
                    }
                );
            }
        });
    }
}
