/**
 * CORS Test Script for Ultra Card Preset Loading
 *
 * Run this in the browser console to test if the CORS-resilient preset loading works.
 * This script will test all available methods and report which ones work.
 */

(async function testCorsResilience() {
  console.log('🔍 Testing CORS-resilient preset loading...\n');

  // Import the API (this assumes Ultra Card is already loaded)
  let api;
  try {
    // Try to get the API instance from the global scope
    if (window.ultraCard && window.ultraCard.directoriesProPresetsAPI) {
      api = window.ultraCard.directoriesProPresetsAPI;
    } else {
      console.log('⚠️  Ultra Card not found in global scope, creating test API...');
      // Create a minimal test version
      api = {
        async testConnection() {
          const testUrl = 'https://ultracard.io/wp-json/wp/v2/presets_dir_ltg?per_page=1';
          const corsProxies = [
            'https://api.allorigins.win/raw?url=',
            'https://corsproxy.io/?',
            'https://cors-anywhere.herokuapp.com/',
          ];
          const results = [];

          // Test direct fetch
          console.log('📡 Testing direct fetch...');
          try {
            const response = await fetch(testUrl, {
              method: 'GET',
              headers: { Accept: 'application/json' },
              signal: AbortSignal.timeout(5000),
            });
            if (response.ok) {
              results.push({ method: 'Direct Fetch', success: true });
              console.log('✅ Direct fetch: SUCCESS');
            } else {
              throw new Error(`HTTP ${response.status}`);
            }
          } catch (error) {
            results.push({
              method: 'Direct Fetch',
              success: false,
              error: error.message,
            });
            console.log('❌ Direct fetch: FAILED -', error.message);
          }

          // Test CORS proxies
          for (const proxy of corsProxies) {
            console.log(`📡 Testing proxy: ${proxy}...`);
            try {
              const proxyUrl = `${proxy}${encodeURIComponent(testUrl)}`;
              const response = await fetch(proxyUrl, {
                method: 'GET',
                headers: { Accept: 'application/json' },
                signal: AbortSignal.timeout(8000),
              });
              if (response.ok) {
                results.push({ method: `Proxy: ${proxy}`, success: true });
                console.log(`✅ Proxy ${proxy}: SUCCESS`);
              } else {
                throw new Error(`HTTP ${response.status}`);
              }
            } catch (error) {
              results.push({
                method: `Proxy: ${proxy}`,
                success: false,
                error: error.message,
              });
              console.log(`❌ Proxy ${proxy}: FAILED -`, error.message);
            }
          }

          return results;
        },

        async fetchPresets() {
          console.log('📦 Testing full preset loading...');
          const testUrl =
            'https://ultracard.io/wp-json/wp/v2/presets_dir_ltg?per_page=5&_embed=true';

          try {
            const response = await fetch(testUrl, {
              method: 'GET',
              headers: { Accept: 'application/json' },
              signal: AbortSignal.timeout(10000),
            });

            if (!response.ok) {
              throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            console.log(`✅ Successfully loaded ${data.length} presets`);
            return { presets: data, total: data.length };
          } catch (error) {
            console.log('❌ Preset loading failed:', error.message);
            console.log('🔄 Trying CORS proxies...');

            const corsProxies = ['https://api.allorigins.win/raw?url=', 'https://corsproxy.io/?'];

            for (const proxy of corsProxies) {
              try {
                const proxyUrl = `${proxy}${encodeURIComponent(testUrl)}`;
                const response = await fetch(proxyUrl, {
                  method: 'GET',
                  headers: { Accept: 'application/json' },
                  signal: AbortSignal.timeout(10000),
                });

                if (response.ok) {
                  const data = await response.json();
                  console.log(`✅ Successfully loaded ${data.length} presets via proxy: ${proxy}`);
                  return { presets: data, total: data.length };
                }
              } catch (proxyError) {
                console.log(`❌ Proxy ${proxy} failed:`, proxyError.message);
              }
            }

            throw error;
          }
        },
      };
    }
  } catch (error) {
    console.error('❌ Failed to initialize API:', error);
    return;
  }

  // Run connection tests
  console.log('🧪 Running connection tests...\n');
  try {
    const connectionResults = await api.testConnection();

    console.log('\n📊 Connection Test Results:');
    console.log('═══════════════════════════════');

    const successfulMethods = connectionResults.filter(r => r.success);
    const failedMethods = connectionResults.filter(r => !r.success);

    if (successfulMethods.length > 0) {
      console.log('\n✅ Working Methods:');
      successfulMethods.forEach(result => {
        console.log(`  • ${result.method}`);
      });
    }

    if (failedMethods.length > 0) {
      console.log('\n❌ Failed Methods:');
      failedMethods.forEach(result => {
        console.log(`  • ${result.method}: ${result.error}`);
      });
    }

    if (successfulMethods.length === 0) {
      console.log(
        '\n⚠️  No connection methods worked. This indicates a network connectivity issue.'
      );
      console.log('   Please check your internet connection and try again.');
    } else {
      console.log(
        `\n🎉 ${successfulMethods.length} out of ${connectionResults.length} methods working!`
      );
      console.log('   Ultra Card should be able to load presets successfully.');
    }
  } catch (error) {
    console.error('❌ Connection test failed:', error);
  }

  // Test actual preset loading
  console.log('\n🧪 Testing preset loading...\n');
  try {
    const presetResult = await api.fetchPresets();
    console.log('\n🎉 Preset loading test completed successfully!');
    console.log(`   Loaded ${presetResult.total} presets from ultracard.io`);

    if (presetResult.presets.length > 0) {
      console.log('\n📋 Sample presets:');
      presetResult.presets.slice(0, 3).forEach((preset, index) => {
        console.log(`  ${index + 1}. ${preset.title?.rendered || 'Untitled'}`);
      });
    }
  } catch (error) {
    console.error('\n❌ Preset loading test failed:', error);
    console.log(
      '   This suggests the CORS issue is still present or there are other network problems.'
    );
  }

  console.log('\n🏁 CORS resilience test completed!');
  console.log('   If you see successful results above, the fix is working.');
  console.log('   If all methods failed, there may be a broader network connectivity issue.');
})();
