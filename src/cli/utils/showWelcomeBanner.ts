let bannerShown = false;

export function showWelcomeBanner() {
    if (!bannerShown) {
        //console.clear();
        console.log('\n🧠  Welcome to Moteur CLI\n');
        bannerShown = true;
    }
}
