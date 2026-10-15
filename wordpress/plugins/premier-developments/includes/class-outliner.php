<?php
/**
 * "Site plan outliner" box on the development edit screen: pick a plot,
 * click around the house on the site plan, and its outline is saved into
 * the plot's row. No coordinates to type.
 */

defined( 'ABSPATH' ) || exit;

class Premier_Outliner {

	public static function init() {
		add_action( 'add_meta_boxes_development', array( __CLASS__, 'meta_box' ) );
		add_action( 'admin_enqueue_scripts', array( __CLASS__, 'assets' ) );
	}

	public static function meta_box() {
		add_meta_box( 'premier-outliner', 'Site plan outliner', array( __CLASS__, 'render' ), 'development', 'normal', 'default' );
	}

	public static function assets( $hook ) {
		$screen = get_current_screen();
		if ( ! $screen || 'development' !== $screen->post_type || ! in_array( $hook, array( 'post.php', 'post-new.php' ), true ) ) {
			return;
		}
		wp_enqueue_style( 'premier-outliner', PREMIER_DEV_URL . 'assets/admin/outliner.css', array(), PREMIER_DEV_VERSION );
		wp_enqueue_script( 'premier-outliner', PREMIER_DEV_URL . 'assets/admin/outliner.js', array(), PREMIER_DEV_VERSION, true );
	}

	public static function render() {
		?>
		<div class="premier-outliner" data-premier-outliner>
			<p class="po-help">
				Draw around each house so visitors can hover over it on the site plan.
				<strong>1.</strong> Upload the site plan image in the <em>Plots &amp; site plan</em> tab and add your plots.
				<strong>2.</strong> Choose a plot below and click <em>Draw</em>.
				<strong>3.</strong> Click each corner of the house on the plan, then click the first point again (or press <em>Finish</em>).
				<strong>4.</strong> Update the development to save.
			</p>
			<div class="po-empty" hidden>Upload a site plan image in the <em>Plots &amp; site plan</em> tab to start outlining plots.</div>
			<div class="po-layout">
				<div class="po-stage">
					<div class="po-canvas">
						<img class="po-img" alt="">
						<svg class="po-svg" viewBox="0 0 100 100" preserveAspectRatio="none"></svg>
					</div>
					<div class="po-bar">
						<span class="po-status">Choose a plot to draw.</span>
						<span class="po-actions">
							<button type="button" class="button po-undo" disabled>Undo point</button>
							<button type="button" class="button po-cancel" disabled>Cancel</button>
							<button type="button" class="button button-primary po-finish" disabled>Finish</button>
						</span>
					</div>
				</div>
				<ol class="po-list"></ol>
			</div>
		</div>
		<?php
	}
}
