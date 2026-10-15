<?php
/**
 * /developments/ — every development, current first.
 */

defined( 'ABSPATH' ) || exit;

get_header();

if ( premier_requires_plugin() && ( ! function_exists( 'elementor_theme_do_location' ) || ! elementor_theme_do_location( 'archive' ) ) ) :
	$current   = Premier_Data::developments( 'current' );
	$completed = Premier_Data::developments( 'completed' );
	$hero      = $current ? $current[0]['hero'] : ( $completed ? $completed[0]['hero'] : 0 );
	?>
	<main id="main">
		<section class="hero hero-dev hero-plots" aria-labelledby="archive-title">
			<div class="hero-media" aria-hidden="true"><?php echo Premier_Render::img( $hero, 'full', array( 'alt' => '', 'loading' => 'eager' ) ); // phpcs:ignore WordPress.Security.EscapeOutput ?></div>
			<div class="hero-shade" aria-hidden="true"></div>
			<div class="wrap hero-content">
				<p class="eyebrow eyebrow-light hero-fade" style="--d:.25s"><?php echo esc_html( premier_company()['name'] ); ?></p>
				<h1 class="hero-title hero-fade" style="--d:.45s" id="archive-title">Our developments</h1>
			</div>
		</section>
		<section class="section section-alt" id="current" aria-labelledby="current-title">
			<div class="wrap">
				<header class="section-head" data-reveal>
					<p class="eyebrow">Now selling</p>
					<h2 id="current-title" class="display">Current developments</h2>
				</header>
				<?php echo Premier_Render::development_rows( $current ); // phpcs:ignore WordPress.Security.EscapeOutput ?>
			</div>
		</section>
		<?php if ( $completed ) : ?>
		<section class="section section-navy" id="completed" aria-labelledby="completed-title">
			<div class="wrap">
				<header class="section-head" data-reveal>
					<p class="eyebrow eyebrow-light">Our portfolio</p>
					<h2 id="completed-title" class="display">Completed developments</h2>
				</header>
				<?php echo Premier_Render::development_grid( $completed ); // phpcs:ignore WordPress.Security.EscapeOutput ?>
			</div>
		</section>
		<?php endif; ?>
	</main>
	<?php
endif;

get_footer();
