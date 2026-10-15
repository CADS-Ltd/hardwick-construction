<?php
/**
 * Fallback for everything else (blog posts, search, 404).
 */

defined( 'ABSPATH' ) || exit;

get_header();

if ( ! function_exists( 'elementor_theme_do_location' ) || ! elementor_theme_do_location( is_singular() ? 'single' : 'archive' ) ) :
	if ( is_singular() ) :
		while ( have_posts() ) :
			the_post();
			get_template_part( 'template-parts/content-page' );
		endwhile;
	else :
		?>
		<main id="main" class="page-main">
			<div class="wrap page-wrap">
				<h1 class="display page-title"><?php echo is_404() ? 'Page not found' : esc_html( wp_strip_all_tags( get_the_archive_title() ) ); ?></h1>
				<?php if ( is_404() || ! have_posts() ) : ?>
					<p class="lead">Sorry, we could not find that page. <a class="draw" href="<?php echo esc_url( home_url( '/' ) ); ?>">Return to the home page</a>.</p>
				<?php else : ?>
					<ul class="page-list">
						<?php while ( have_posts() ) : the_post(); ?>
							<li><a class="draw" href="<?php the_permalink(); ?>"><?php the_title(); ?></a></li>
						<?php endwhile; ?>
					</ul>
					<?php the_posts_pagination(); ?>
				<?php endif; ?>
			</div>
		</main>
		<?php
	endif;
endif;

get_footer();
