#!/bin/bash
# Download assets from ClickFunnels via temporary hosts entry

BASE_URL="http://aifluency.com"
OUTPUT_DIR="clickfunnels-assets"

mkdir -p "$OUTPUT_DIR/assets"
mkdir -p "$OUTPUT_DIR/hosted/images"

# Download CSS/JS files
echo "Downloading CSS/JS files..."
curl -s -H "Host: aifluency.adavauniversity.org" -H "Referer: https://aifluency.com/" "${BASE_URL}/assets/lander.css" -o "$OUTPUT_DIR/assets/lander.css" && echo "✓ lander.css" || echo "✗ lander.css failed"
curl -s -H "Host: aifluency.adavauniversity.org" -H "Referer: https://aifluency.com/" "${BASE_URL}/assets/lander.js" -o "$OUTPUT_DIR/assets/lander.js" && echo "✓ lander.js" || echo "✗ lander.js failed"
curl -s -H "Host: aifluency.adavauniversity.org" -H "Referer: https://aifluency.com/" "${BASE_URL}/assets/pushcrew.js" -o "$OUTPUT_DIR/assets/pushcrew.js" && echo "✓ pushcrew.js" || echo "✗ pushcrew.js failed"
mkdir -p "$OUTPUT_DIR/assets/userevents"
curl -s -H "Host: aifluency.adavauniversity.org" -H "Referer: https://aifluency.com/" "${BASE_URL}/assets/userevents/application.js" -o "$OUTPUT_DIR/assets/userevents/application.js" && echo "✓ application.js" || echo "✗ application.js failed"
curl -s -H "Host: aifluency.adavauniversity.org" -H "Referer: https://aifluency.com/" "${BASE_URL}/vendor.js" -o "$OUTPUT_DIR/vendor.js" && echo "✓ vendor.js" || echo "✗ vendor.js failed"

# Download images
echo ""
echo "Downloading images..."
IMAGES=(
    "hosted/images/5e/63636e3f3c4e64bd75240a2327bcaf/Adava-Logo.png"
    "hosted/images/55/a09257dde742f0901669af9e5e548d/Learn-2x.png"
    "hosted/images/92/1bb163613c41989e3897952bac2859/NoMandatoryHomework.png"
    "hosted/images/dd/30e297ff05467c85dd87420136410a/Class-Structure.png"
    "hosted/images/fe/0f3efb39ce4d6f805619682ff240a8/LearnIcon.png"
    "hosted/images/1e/d7729b45ba4e8d8f2097d90edc2fd1/GroupUpIcon.png"
    "hosted/images/8d/60c6c33417466690f7e6011a783ee5/Jorge.jpg"
    "hosted/images/c2/e605c1dba3450386b30e0a450dba7b/Aarshavi.jpg"
    "hosted/images/c3/ea67c836eb4c909738b298e1ec3018/Nishit.png"
    "hosted/images/ee/747179109b4669bb4004ea93830a0d/Abhishek.png"
    "hosted/images/0a/bde6b5c9954ce89975139915c7b640/Varun.png"
    "hosted/images/58/8c5d25580a45bfb9ccc620fcb3e6c5/Wilfried-Profile.png"
    "hosted/images/1e/cfe31989e44b23904ebee5365281f5/Chase-Profile.png"
    "hosted/images/47/192e6ce95a4e95af7445f34e9a5e78/AIProjectIcon.png"
    "hosted/images/34/d48b11187f4f87a8208a864e03fc17/CareerIcon.png"
    "hosted/images/08/bf2a2c29254da2a4ea9e53a86c1fdc/Certificate-AIFluency.png"
    "hosted/images/23/0bfeef390a41f79413241de88e7425/Certificate-Award.png"
    "hosted/images/cf/1cc7d05af1445283a88f28698b3b59/AI-Fluency-Generative-Adversarial-Networks-Poster-Thumbnail.png"
    "hosted/images/b7/93bf0975ee46eda22dba4226fee19f/AI-Fluency-State-Rewards-AI-Poster-Thumbnail.png"
    "hosted/images/63/d78bf9885646819e15f2e46824de96/AI-Fluency-Decision-Trees-Poster-Thumbnail.png"
    "hosted/images/b3/2624a41c274508b0362d9d5a39437a/Adava-World-Map.png"
    "hosted/images/9c/59e46f7e0347068b7b014d09d46451/Age-Icon.png"
    "hosted/images/b8/2c2434f0534d4b94831d65a6cb01e5/Grades-Icon.png"
    "hosted/images/fe/f260942eeb409ab750933cc41ef1d5/Programming-Icon.png"
    "hosted/images/a3/c389c2aad04d4ba792f35892390242/Groups-Icon.png"
    "hosted/images/ed/053098c6384e70a5fee14182f8aced/Theory-Icon.png"
    "hosted/images/85/7aa719052c4051a37ed2a63fb63744/Programming-Icon.png"
    "hosted/images/e4/10d46250c04fae97fec78b45d3a29d/Class-Breakdown-Mobile.png"
    "hosted/images/a6/2cbc909874420fa1e4cb4d3ac479ed/Class-Breakdown-1.png"
    "hosted/images/6e/cf32bbcfdc446eae5da2369daff5e6/Class-Breakdown-2.png"
    "hosted/images/b0/b014b75069404b9614900f72146f84/Admission-Cost-Icon.png"
    "hosted/images/6c/87c382791147dbbd0f42180a989b27/Admission-Deadline-Icon.png"
    "hosted/images/50/9c93390dfb4acf95a97acd2b239503/Admission-Cost-Icon-Software-Alt.png"
    "hosted/images/93/119c217a554df5b904514911eb23cf/Admission-Deadline-Icon-Software-Alt.png"
    "hosted/images/9a/a7ab14aff54ccaa8d2ad39ca5ecd24/Calendar-Box-Icon.png"
    "hosted/images/cf/0ddd0e157f4ef9ae94439d0272c67d/noise-transparent-strong-1.png"
    "hosted/images/images/purple-geo.png"
    "hosted/images/56/feea26eccf492689cdfe97010747d5/AlumniStories-Background.png"
    "hosted/images/25/6475bb36514ea88368350924371a81/ClassesDesignedAroundYouBG.jpg"
    "hosted/images/ed/161a82018e4e11b05fe3ecdc1c7f5b/Homepage-Main-Banner.jpg"
    "hosted/images/3d/392630953c4119a324492bb1c05778/ClickfunnelsTag.png"
)

for img in "${IMAGES[@]}"; do
    dir=$(dirname "$OUTPUT_DIR/$img")
    mkdir -p "$dir"
    filename=$(basename "$img")
    curl -s -H "Host: aifluency.adavauniversity.org" -H "Referer: https://aifluency.com/" "${BASE_URL}/$img" -o "$OUTPUT_DIR/$img" && echo "✓ $filename" || echo "✗ $filename failed"
done

echo ""
echo "Done! Assets downloaded to $OUTPUT_DIR/"

