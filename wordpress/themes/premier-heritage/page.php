<?php
/**
 * Pages. Pages built with Elementor get the full width; others get a simple title and text layout.
 */

defined( 'ABSPATH' ) || exit;

get_header();

while ( have_posts() ) :
	the_post();
	$elementor = get_post_meta( get_the_ID(), '_elementor_edit_mode', true ) === 'builder';
	if ( $elementor ) :
		?>
		<main id="main" class="elementor-page-content"><?php the_content(); ?></main>
		<?php
	else :
		get_template_part( 'template-parts/content-page' );
	endif;
endwhile;

get_footer();
