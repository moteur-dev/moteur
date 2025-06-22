"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.showWelcomeBanner = showWelcomeBanner;
var bannerShown = false;
function showWelcomeBanner() {
    if (!bannerShown) {
        //console.clear();
        console.log('\n🧠  Welcome to Moteur CLI\n');
        bannerShown = true;
    }
}
