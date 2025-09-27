<?php
/**
 * SIMPLE CORS FIX for Ultra Card Presets
 * Add this to your WordPress functions.php or as a plugin
 */

// Fix CORS for Ultra Card presets - SIMPLE VERSION
function ultracard_fix_cors() {
    // Allow all origins for Ultra Card API
    if (strpos($_SERVER['REQUEST_URI'], '/wp-json/wp/v2/presets_dir_ltg') !== false) {
        header('Access-Control-Allow-Origin: *');
        header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
        header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
        
        // Handle preflight requests
        if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
            http_response_code(200);
            exit();
        }
    }
}

// Apply the fix early and often
add_action('init', 'ultracard_fix_cors', 1);
add_action('rest_api_init', 'ultracard_fix_cors', 1);
add_action('wp_loaded', 'ultracard_fix_cors', 1);

// Also fix it via filter
add_filter('rest_pre_serve_request', function($served, $result, $request, $server) {
    if (strpos($request->get_route(), '/presets_dir_ltg') !== false) {
        header('Access-Control-Allow-Origin: *');
        header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
        header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
    }
    return $served;
}, 10, 4);

?>
