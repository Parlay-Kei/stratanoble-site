const { chromium } = require('playwright');

async function checkLinkedInProfile() {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({
    storageState: './linkedin-session.json',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
  });
  const page = await context.newPage();

  console.log('🔍 Checking Steve Hubbard LinkedIn profile for P02 post...');

  try {
    await page.goto('https://www.linkedin.com/in/mr-steve-hubbard/recent-activity/all/', {
      waitUntil: 'domcontentloaded',
      timeout: 30000
    });

    await page.waitForTimeout(3000);

    // Look for the specific post content
    const searchText = 'It\'s just a quick manual step';
    const pageContent = await page.content();

    if (pageContent.includes(searchText)) {
      console.log('✅ POST FOUND on profile!');

      // Look for post URLs in various ways
      try {
        const feedPosts = await page.$$('.feed-shared-update-v2');
        for (const post of feedPosts) {
          const text = await post.textContent();
          if (text && text.includes(searchText)) {
            // Try to find the post URL
            const postLink = await post.$('a[href*="/feed/update/"]');
            if (postLink) {
              const url = await postLink.getAttribute('href');
              console.log('🔗 Post permalink found:', url);
            }
            break;
          }
        }
      } catch (e) {
        console.log('Could not extract post URL, but post is visible');
      }

      await page.screenshot({ path: './manual-verification-success.png', fullPage: true });
      console.log('📸 Screenshot saved: manual-verification-success.png');

    } else {
      console.log('❌ Post not found on profile feed');
      console.log('Let me check the main feed instead...');

      // Try main feed
      await page.goto('https://www.linkedin.com/feed/', {
        waitUntil: 'domcontentloaded',
        timeout: 30000
      });

      await page.waitForTimeout(3000);
      const feedContent = await page.content();

      if (feedContent.includes(searchText)) {
        console.log('✅ POST FOUND on main feed!');
        await page.screenshot({ path: './manual-verification-found-on-feed.png', fullPage: true });
      } else {
        console.log('❌ Post not found on main feed either');
        await page.screenshot({ path: './manual-verification-notfound.png', fullPage: true });
      }
    }

  } catch (error) {
    console.error('Error checking profile:', error.message);
  }

  await browser.close();
}

checkLinkedInProfile().catch(console.error);