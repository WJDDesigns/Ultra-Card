/**
 * Directories Pro Integration for Ultra Card Presets
 * Add this to WP Code Snippets (without <?php tags)
 * Title: Directories Pro Ultra Card Integration
 * Type: PHP Snippet
 * Location: Run Everywhere
 */

// Enable Directories Pro presets in REST API
function enable_directories_pro_presets_api() {
    global $wp_post_types;
    
    if (isset($wp_post_types['presets_dir_ltg'])) {
        $wp_post_types['presets_dir_ltg']->show_in_rest = true;
        $wp_post_types['presets_dir_ltg']->rest_base = 'presets_dir_ltg';
        $wp_post_types['presets_dir_ltg']->rest_controller_class = 'WP_REST_Posts_Controller';
    }
}
add_action('init', 'enable_directories_pro_presets_api', 25);

// Add preset meta for Directories Pro
function add_directories_pro_preset_meta() {
    register_rest_field('presets_dir_ltg', 'preset_meta', array(
        'get_callback' => function($post) {
            $post_id = $post['id'];
            
            // Get preset code from Directories Pro field
            $shortcode = get_post_meta($post_id, 'preset_code', true);
            
            // Try alternative Directories Pro field names
            if (empty($shortcode)) {
                $shortcode = get_post_meta($post_id, 'field_preset_code', true);
            }
            if (empty($shortcode)) {
                $shortcode = get_post_meta($post_id, 'drts_preset_code', true);
            }
            
            // Debug logging
            error_log("Directories Pro: Getting preset_code for post $post_id: " . substr($shortcode ?: 'EMPTY', 0, 100) . "...");
            
            // Get all meta keys for debugging
            $all_meta = get_post_meta($post_id);
            $meta_keys = array_keys($all_meta);
            error_log("Available meta keys for post $post_id: " . implode(', ', $meta_keys));
            
            return array(
                'shortcode' => $shortcode ?: '{"rows":[]}',
                'category' => 'badges', // From your API response
                'tags' => 'location,person', // From your class_list
                'difficulty' => 'beginner',
                'compatibility' => '',
                'downloads' => 0,
                'rating' => 0,
                'featured_image' => get_the_post_thumbnail_url($post_id, 'large') ?: '',
                'gallery' => array(),
            );
        }
    ));
}
add_action('rest_api_init', 'add_directories_pro_preset_meta');

// Enable CORS
function add_cors_http_header() {
    header("Access-Control-Allow-Origin: *");
    header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
    header("Access-Control-Allow-Headers: Content-Type, Authorization");
}
add_action('rest_api_init', 'add_cors_http_header');

// Force save preset code for Directories Pro (uncomment to run once)
// add_action('init', 'force_save_directories_pro_preset');

function force_save_directories_pro_preset() {
    $post_id = 517; // Your new Directories Pro preset ID
    $shortcode = '[ultra_card]eyJ0eXBlIjoidWx0cmEtY2FyZC1yb3ciLCJ2ZXJzaW9uIjoiMS4yLjAtYmV0YTgiLCJkYXRhIjp7ImlkIjoicm93MSIsImNvbHVtbnMiOlt7ImlkIjoiY29sMSIsIm1vZHVsZXMiOlt7ImlkIjoiaG9yaXpvbnRhbC0xNzU4MzE3MTQ0MTUyLWdxNWQ3Y3N4OSIsInR5cGUiOiJob3Jpem9udGFsIiwiYWxpZ25tZW50Ijoic3BhY2UtYmV0d2VlbiIsInZlcnRpY2FsX2FsaWdubWVudCI6ImNlbnRlciIsImdhcCI6MC43LCJ3cmFwIjpmYWxzZSwibW9kdWxlcyI6W3siaWQiOiJpbWFnZS0xNzU4MzE1NDg2ODcxLTdwcXd2N3VwYSIsInR5cGUiOiJpbWFnZSIsImltYWdlX3R5cGUiOiJ1cmwiLCJoZWlnaHQiOiI0MHB4IiwiYm9yZGVyIjp7InJhZGl1cyI6NTAsInN0eWxlIjoic29saWQiLCJ3aWR0aCI6IjJweCIsImNvbG9yIjoiIzAwRkYwMCJ9LCJvYmplY3RfZml0IjoiY292ZXIiLCJ3aWR0aCI6IjQwcHgiLCJhc3BlY3RfcmF0aW8iOiIxLzEiLCJkZXNpZ24iOnsiYm9yZGVyX3JhZGl1cyI6IjUwJSJ9LCJpbWFnZV91cmwiOiJodHRwczovL2Nkbi1pY29ucy1wbmcuZnJlZXBpay5jb20vNTEyLzMxNzcvMzE3NzQ0MC5wbmcifSx7ImlkIjoiaWNvbi0xNzU4MzE3MTYxNzExLTE3ZTJ1NnZxMCIsInR5cGUiOiJpY29uIiwiaWNvbnMiOlt7ImlkIjoiaWNvbi1pdGVtLTE3NTgzMTcxNjE3MTEtMDRpeWV3MHdnIiwiZW50aXR5IjoicGVyc29uLmhhX2xhYnMiLCJuYW1lIjoiIiwiaWNvbl9pbmFjdGl2ZSI6Im1kaTphY2NvdW50IiwiaWNvbl9hY3RpdmUiOiJtZGk6YWNjb3VudCIsImluYWN0aXZlX3N0YXRlIjoiIiwiYWN0aXZlX3N0YXRlIjoiIiwiY3VzdG9tX2luYWN0aXZlX3N0YXRlX3RleHQiOiIiLCJjdXN0b21fYWN0aXZlX3N0YXRlX3RleHQiOiIiLCJjdXN0b21faW5hY3RpdmVfbmFtZV90ZXh0IjoiIiwiY3VzdG9tX2FjdGl2ZV9uYW1lX3RleHQiOiIiLCJpbmFjdGl2ZV90ZW1wbGF0ZV9tb2RlIjpmYWxzZSwiaW5hY3RpdmVfdGVtcGxhdGUiOiIiLCJhY3RpdmVfdGVtcGxhdGVfbW9kZSI6ZmFsc2UsImFjdGl2ZV90ZW1wbGF0ZSI6IiIsInVzZV9lbnRpdHlfY29sb3JfZm9yX2ljb24iOmZhbHNlLCJ1c2Vfc3RhdGVfY29sb3JfZm9yX2luYWN0aXZlX2ljb24iOmZhbHNlLCJ1c2Vfc3RhdGVfY29sb3JfZm9yX2FjdGl2ZV9pY29uIjpmYWxzZSwiY29sb3JfaW5hY3RpdmUiOiJ2YXIoLS1zZWNvbmRhcnktdGV4dC1jb2xvcikiLCJjb2xvcl9hY3RpdmUiOiJ2YXIoLS1wcmltYXJ5LWNvbG9yKSIsImluYWN0aXZlX2ljb25fY29sb3IiOiJ2YXIoLS1zZWNvbmRhcnktdGV4dC1jb2xvcikiLCJhY3RpdmVfaWNvbl9jb2xvciI6InZhcigtLXByaW1hcnktY29sb3IpIiwiaW5hY3RpdmVfbmFtZV9jb2xvciI6InZhcigtLXByaW1hcnktdGV4dC1jb2xvcikiLCJhY3RpdmVfbmFtZV9jb2xvciI6InZhcigtLXByaW1hcnktdGV4dC1jb2xvcikiLCJpbmFjdGl2ZV9zdGF0ZV9jb2xvciI6IiNGRkZGRkYiLCJhY3RpdmVfc3RhdGVfY29sb3IiOiIjRkZGRkZGIiwic2hvd19uYW1lX3doZW5faW5hY3RpdmUiOmZhbHNlLCJzaG93X3N0YXRlX3doZW5faW5hY3RpdmUiOnRydWUsInNob3dfaWNvbl93aGVuX2luYWN0aXZlIjpmYWxzZSwic2hvd19uYW1lX3doZW5fYWN0aXZlIjpmYWxzZSwic2hvd19zdGF0ZV93aGVuX2FjdGl2ZSI6dHJ1ZSwic2hvd19pY29uX3doZW5fYWN0aXZlIjpmYWxzZSwic2hvd19zdGF0ZSI6dHJ1ZSwic2hvd19uYW1lIjp0cnVlLCJzaG93X3VuaXRzIjp0cnVlLCJlbmFibGVfaG92ZXJfZWZmZWN0IjpmYWxzZSwiaWNvbl9zaXplIjoyNiwidGV4dF9zaXplIjoxNCwibmFtZV9pY29uX2dhcCI6OCwibmFtZV9zdGF0ZV9nYXAiOjIsImljb25fc3RhdGVfZ2FwIjo0LCJhY3RpdmVfaWNvbl9zaXplIjoyNiwiaW5hY3RpdmVfaWNvbl9zaXplIjoyNiwiYWN0aXZlX3RleHRfc2l6ZSI6MTQsImluYWN0aXZlX3RleHRfc2l6ZSI6MTQsInN0YXRlX3NpemUiOjE0LCJhY3RpdmVfc3RhdGVfc2l6ZSI6MTQsImluYWN0aXZlX3N0YXRlX3NpemUiOjE0LCJpY29uX3NpemVfbG9ja2VkIjp0cnVlLCJ0ZXh0X3NpemVfbG9ja2VkIjp0cnVlLCJzdGF0ZV9zaXplX2xvY2tlZCI6dHJ1ZSwiYWN0aXZlX2ljb25fbG9ja2VkIjp0cnVlLCJhY3RpdmVfaWNvbl9jb2xvcl9sb2NrZWQiOmZhbHNlLCJhY3RpdmVfaWNvbl9iYWNrZ3JvdW5kX2xvY2tlZCI6dHJ1ZSwiYWN0aXZlX2ljb25fYmFja2dyb3VuZF9jb2xvcl9sb2NrZWQiOnRydWUsImFjdGl2ZV9uYW1lX2xvY2tlZCI6dHJ1ZSwiYWN0aXZlX25hbWVfY29sb3JfbG9ja2VkIjp0cnVlLCJhY3RpdmVfc3RhdGVfbG9ja2VkIjpmYWxzZSwiYWN0aXZlX3N0YXRlX2NvbG9yX2xvY2tlZCI6dHJ1ZSwiaWNvbl9iYWNrZ3JvdW5kIjoibm9uZSIsInVzZV9lbnRpdHlfY29sb3JfZm9yX2ljb25fYmFja2dyb3VuZCI6ZmFsc2UsImljb25fYmFja2dyb3VuZF9jb2xvciI6InRyYW5zcGFyZW50IiwiaW5hY3RpdmVfaWNvbl9hbmltYXRpb24iOiJub25lIiwiYWN0aXZlX2ljb25fYW5pbWF0aW9uIjoibm9uZSIsInZlcnRpY2FsX2FsaWdubWVudCI6ImNlbnRlciIsImNvbnRhaW5lcl9iYWNrZ3JvdW5kX3NoYXBlIjoibm9uZSIsImNvbnRhaW5lcl9iYWNrZ3JvdW5kX2NvbG9yIjoiIzgwODA4MCIsInRhcF9hY3Rpb24iOnsiYWN0aW9uIjoibm90aGluZyJ9LCJob2xkX2FjdGlvbiI6eyJhY3Rpb24iOiJub3RoaW5nIn0sImRvdWJsZV90YXBfYWN0aW9uIjp7ImFjdGlvbiI6Im5vdGhpbmcifSwiY2xpY2tfYWN0aW9uIjoidG9nZ2xlIiwiZG91YmxlX2NsaWNrX2FjdGlvbiI6Im5vbmUiLCJob2xkX2FjdGlvbl9sZWdhY3kiOiJub25lIiwibmF2aWdhdGlvbl9wYXRoIjoiIiwidXJsIjoiIiwic2VydmljZSI6IiIsInNlcnZpY2VfZGF0YSI6e30sInRlbXBsYXRlX21vZGUiOmZhbHNlLCJ0ZW1wbGF0ZSI6IiIsImR5bmFtaWNfaWNvbl90ZW1wbGF0ZV9tb2RlIjpmYWxzZSwiZHluYW1pY19pY29uX3RlbXBsYXRlIjoiIiwiZHluYW1pY19jb2xvcl90ZW1wbGF0ZV9tb2RlIjpmYWxzZSwiZHluYW1pY19jb2xvcl90ZW1wbGF0ZSI6IiJ9XSwiY29sdW1ucyI6MywiZ2FwIjoxNiwidGFwX2FjdGlvbiI6eyJhY3Rpb24iOiJub3RoaW5nIn0sImhvbGRfYWN0aW9uIjp7ImFjdGlvbiI6Im5vdGhpbmcifSwiZG91YmxlX3RhcF9hY3Rpb24iOnsiYWN0aW9uIjoibm90aGluZyJ9LCJkaXNwbGF5X21vZGUiOiJhbHdheXMiLCJkaXNwbGF5X2NvbmRpdGlvbnMiOltdLCJkZXNpZ24iOnsiZm9udF93ZWlnaHQiOiI3MDAiLCJ0ZXh0X2FsaWduIjoibGVmdCJ9fV0sInRhcF9hY3Rpb24iOnsiYWN0aW9uIjoibm90aGluZyJ9LCJob2xkX2FjdGlvbiI6eyJhY3Rpb24iOiJub3RoaW5nIn0sImRvdWJsZV90YXBfYWN0aW9uIjp7ImFjdGlvbiI6Im5vdGhpbmcifSwiZGlzcGxheV9tb2RlIjoiYWx3YXlzIiwiZGlzcGxheV9jb25kaXRpb25zIjpbXSwiZGVzaWduIjp7ImJhY2tncm91bmRfY29sb3IiOiIjMzMzMzMzIn0sImJhY2tncm91bmRfY29sb3IiOiIjMzMzMzMzIiwid2lkdGgiOiIxNDBweCIsImJvcmRlcl9zdHlsZSI6IiIsImJvcmRlciI6eyJyYWRpdXMiOjYwLCJzdHlsZSI6IiIsIndpZHRoIjoiIiwiY29sb3IiOiJ2YXIoLS1kaXZpZGVyLWNvbG9yKSJ9LCJib3JkZXJfcmFkaXVzIjoiNjAiLCJib3JkZXJfd2lkdGgiOiIiLCJoZWlnaHQiOiI1MHB4IiwicGFkZGluZ19sZWZ0IjoiNHB4IiwicGFkZGluZyI6eyJ0b3AiOiIiLCJsZWZ0IjoiNHB4IiwicmlnaHQiOiIxNnB4In0sInBhZGRpbmdfcmlnaHQiOiIxNnB4IiwicGFkZGluZ190b3AiOiIiLCJtYXJnaW5fbGVmdCI6ImF1dG8iLCJtYXJnaW4iOnsibGVmdCI6ImF1dG8iLCJyaWdodCI6ImF1dG8ifSwibWFyZ2luX3JpZ2h0IjoiYXV0byJ9XSwiZGVzaWduIjp7fX1dLCJjb2x1bW5fbGF5b3V0IjoiMS1jb2wiLCJnYXAiOjYsImRlc2lnbiI6eyJwYWRkaW5nX2xlZnQiOiIxNnB4IiwicGFkZGluZ19yaWdodCI6IjE2cHgiLCJwYWRkaW5nX3RvcCI6IjE2cHgiLCJwYWRkaW5nX2JvdHRvbSI6IjE2cHgifX0sIm1ldGFkYXRhIjp7ImV4cG9ydGVkIjoiMjAyNS0wOS0yMFQyMDowMTozOS43OTBaIiwibmFtZSI6IlJvdyAxIn19[/ultra_card]';
    
    // Force save the preset code
    update_post_meta($post_id, 'preset_code', $shortcode);
    
    error_log("Directories Pro: Force saved preset code for post $post_id");
}
