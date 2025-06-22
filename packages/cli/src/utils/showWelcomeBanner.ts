let bannerShown = false;

export function showWelcomeBanner(): void {
    if (!bannerShown) {
        //console.clear();
        console.log('\n🧠  Welcome to Moteur CLI\n');
        bannerShown = true;
    }
}
