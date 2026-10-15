<?php
/**
 * Simple page layout: title and the editor content.
 */

defined( 'ABSPATH' ) || exit;
?>
<main id="main" class="page-main">
	<article <?php post_class( 'wrap page-wrap' ); ?>>
		<h1 class="display page-title"><?php the_title(); ?></h1>
		<div class="prose page-content"><?php the_content(); ?></div>
	</article>
</main>
