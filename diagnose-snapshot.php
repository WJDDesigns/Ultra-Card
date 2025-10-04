<?php
/**
 * Diagnostic Script for Ultra Card Snapshots
 * Version: 1.0
 * 
 * PURPOSE: Debug snapshot storage and retrieval issues
 * STATUS: Fix applied in v1.2.4 - Keep this file for future diagnostics only
 * 
 * USAGE:
 * 1. Upload this file to your WordPress root directory
 * 2. Access via browser: https://yoursite.com/diagnose-snapshot.php?snapshot_id=XXX
 * 3. Replace XXX with the actual snapshot post ID from WordPress
 * 4. Must be logged in as WordPress admin
 * 
 * WHAT IT CHECKS:
 * - Post existence and metadata
 * - Data storage integrity (size, encoding)
 * - JSON decode success/failure
 * - Cards array presence and count
 * - Direct database query vs get_post_meta comparison
 * 
 * DELETE THIS FILE after confirming snapshots work correctly (optional security measure)
 */

// Load WordPress
require_once('wp-load.php');

if (!current_user_can('manage_options')) {
    die('Access denied. You must be an administrator.');
}

$snapshot_id = isset($_GET['snapshot_id']) ? intval($_GET['snapshot_id']) : 0;

if (!$snapshot_id) {
    die('Please provide a snapshot_id parameter. Example: ?snapshot_id=737');
}

echo "<h1>Ultra Card Snapshot Diagnostic</h1>";
echo "<h2>Snapshot ID: {$snapshot_id}</h2>";

// Check if post exists
$post = get_post($snapshot_id);
if (!$post) {
    die("<p style='color:red;'>❌ Post not found!</p>");
}

echo "<h3>Post Information</h3>";
echo "<pre>";
echo "Post Type: " . get_post_type($snapshot_id) . "\n";
echo "Post Status: " . $post->post_status . "\n";
echo "Post Date: " . $post->post_date . "\n";
echo "Post Author: " . $post->post_author . "\n";
echo "</pre>";

// Get all post meta
echo "<h3>Post Meta</h3>";
$all_meta = get_post_meta($snapshot_id);
echo "<pre>";
echo "snapshot_type: " . get_post_meta($snapshot_id, 'snapshot_type', true) . "\n";
echo "snapshot_date: " . get_post_meta($snapshot_id, 'snapshot_date', true) . "\n";
echo "card_count: " . get_post_meta($snapshot_id, 'card_count', true) . "\n";
echo "</pre>";

// Get snapshot data
echo "<h3>Snapshot Data Analysis</h3>";
$snapshot_data_json = get_post_meta($snapshot_id, 'snapshot_data', true);

echo "<pre>";
echo "Data exists: " . (empty($snapshot_data_json) ? '❌ NO' : '✅ YES') . "\n";
echo "Data type: " . gettype($snapshot_data_json) . "\n";
echo "Data length (raw): " . strlen($snapshot_data_json) . " bytes (" . round(strlen($snapshot_data_json) / 1024, 2) . " KB)\n";
echo "\n";

if (empty($snapshot_data_json)) {
    echo "<span style='color:red;'>❌ CRITICAL: No snapshot_data found!</span>\n";
    echo "\nAll meta keys for this post:\n";
    print_r(array_keys($all_meta));
} else {
    // NEW in v1.2.4: Try base64 decode first
    echo "🔓 Attempting base64 decode...\n";
    $decoded_json = base64_decode($snapshot_data_json, true);
    
    if ($decoded_json !== false) {
        echo "✅ Base64 decode successful! (NEW v1.2.4 format)\n";
        echo "Decoded JSON length: " . strlen($decoded_json) . " bytes (" . round(strlen($decoded_json) / 1024, 2) . " KB)\n";
        $snapshot_data_json = $decoded_json;
    } else {
        echo "⚠️ Not base64 encoded (legacy format)\n";
    }
    echo "\n";
    
    // Try to decode JSON
    echo "📋 Attempting JSON decode...\n";
    $snapshot_data = json_decode($snapshot_data_json, true);
    
    if ($snapshot_data === null) {
        echo "<span style='color:red;'>❌ JSON DECODE FAILED!</span>\n";
        echo "JSON Error: " . json_last_error_msg() . " (code: " . json_last_error() . ")\n";
        echo "\nFirst 1000 characters of stored data:\n";
        echo htmlspecialchars(substr($snapshot_data_json, 0, 1000));
        echo "\n...\n";
        echo "\nLast 500 characters of stored data:\n";
        echo htmlspecialchars(substr($snapshot_data_json, -500));
    } else {
        echo "✅ JSON decode successful!\n";
        echo "\nDecoded data keys: " . implode(', ', array_keys($snapshot_data)) . "\n";
        echo "Has 'cards' key: " . (isset($snapshot_data['cards']) ? '✅ YES' : '❌ NO') . "\n";
        
        if (isset($snapshot_data['cards'])) {
            echo "Cards count: " . count($snapshot_data['cards']) . "\n";
            echo "Cards is array: " . (is_array($snapshot_data['cards']) ? '✅ YES' : '❌ NO') . "\n";
            
            if (count($snapshot_data['cards']) > 0) {
                echo "\nFirst card sample:\n";
                print_r(array_slice($snapshot_data['cards'][0], 0, 5));
            }
        } else {
            echo "<span style='color:red;'>❌ No 'cards' key found!</span>\n";
            echo "\nAvailable keys:\n";
            print_r(array_keys($snapshot_data));
        }
    }
}

echo "</pre>";

echo "<hr>";
echo "<h3>Database Direct Query</h3>";
global $wpdb;
$meta_value = $wpdb->get_var($wpdb->prepare(
    "SELECT meta_value FROM {$wpdb->postmeta} WHERE post_id = %d AND meta_key = 'snapshot_data'",
    $snapshot_id
));

echo "<pre>";
echo "Direct query result type: " . gettype($meta_value) . "\n";
echo "Direct query result length: " . strlen($meta_value) . " bytes\n";
echo "Matches get_post_meta: " . ($meta_value === $snapshot_data_json ? '✅ YES' : '❌ NO') . "\n";

if ($meta_value !== $snapshot_data_json) {
    echo "\n<span style='color:red;'>⚠️ MISMATCH DETECTED!</span>\n";
    echo "get_post_meta length: " . strlen($snapshot_data_json) . "\n";
    echo "Direct query length: " . strlen($meta_value) . "\n";
    echo "Difference: " . abs(strlen($snapshot_data_json) - strlen($meta_value)) . " bytes\n";
}
echo "</pre>";

echo "<hr>";
echo "<p><strong>Diagnostic complete!</strong></p>";

