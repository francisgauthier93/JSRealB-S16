#actualize lex,rule and feat
python Loaders/actualizeLexRuleFeat.py

cp -rf data ../web_page_gauthif/
cp -rf documentation ../web_page_gauthif/
cp -rf test ../web_page_gauthif/
cp -rf static ../web_page_gauthif/


cat static/js/JSrealB.js Loaders/loaderFr_withoutJSrealB.js > JSrealB-Fr.js
cat static/js/JSrealB.js Loaders/loaderEn_withoutJSrealB.js > JSrealB-En.js
cat static/js/JSrealB.js Loaders/loaderEnFr_withoutJSrealB.js > JSrealB-EnFr.js


cp -rf JSrealB-Fr.js ../web_page_gauthif/
cp -rf JSrealB-En.js ../web_page_gauthif/
cp -rf JSrealB-EnFr.js ../web_page_gauthif/

echo 'JSrealB script succesfully pushed to web_page_gauthif'
