<?php
/**
 * Premier Property Elementor widgets. Loaded only when Elementor registers widgets.
 */

defined( 'ABSPATH' ) || exit;

use Elementor\Controls_Manager;
use Elementor\Repeater;
use Elementor\Widget_Base;

/** Shared helpers for all Premier widgets. */
abstract class Premier_Widget_Base extends Widget_Base {

	public function get_categories() {
		return array( 'premier' );
	}

	public function get_keywords() {
		return array( 'premier', 'development', 'plots', 'heritage' );
	}

	/** Allows <em> and <br> in headings so a word can be set in italic gold. */
	protected function heading_html( $text ) {
		return wp_kses( $text, array( 'em' => array(), 'br' => array(), 'strong' => array() ) );
	}

	protected function link_attrs( $link ) {
		$url = is_array( $link ) ? ( $link['url'] ?? '' ) : (string) $link;
		$out = ' href="' . esc_url( $url ?: '#' ) . '"';
		if ( is_array( $link ) && ! empty( $link['is_external'] ) ) {
			$out .= ' target="_blank" rel="noopener"';
		}
		return $out;
	}

	protected function development_control() {
		$this->add_control( 'development', array(
			'label'       => 'Development',
			'type'        => Controls_Manager::SELECT,
			'options'     => Premier_Elementor::development_options(),
			'default'     => '',
			'description' => 'Leave on “This page’s development” when the widget is on a development or house type page (for example in a Theme Builder template).',
		) );
	}

	protected function development() {
		$s = $this->get_settings_for_display();
		$d = Premier_Shortcodes::resolve( $s['development'] ?? '' );
		if ( ! $d && \Elementor\Plugin::$instance->editor->is_edit_mode() ) {
			// In the editor on a non-development page, preview the first development with plots
			foreach ( Premier_Data::developments() as $candidate ) {
				if ( $candidate['plots'] ) {
					return $candidate;
				}
			}
		}
		return $d;
	}

	protected function placeholder( $text ) {
		if ( \Elementor\Plugin::$instance->editor->is_edit_mode() ) {
			echo '<div class="premier-placeholder">' . esc_html( $text ) . '</div>';
		}
	}

	protected function section_controls( $defaults ) {
		$this->add_control( 'eyebrow', array( 'label' => 'Small label', 'type' => Controls_Manager::TEXT, 'default' => $defaults['eyebrow'] ?? '', 'label_block' => true ) );
		$this->add_control( 'heading', array( 'label' => 'Heading', 'type' => Controls_Manager::TEXTAREA, 'rows' => 2, 'default' => $defaults['heading'] ?? '', 'description' => 'Wrap a word in &lt;em&gt;…&lt;/em&gt; to set it in italic gold.' ) );
		if ( array_key_exists( 'intro', $defaults ) ) {
			$this->add_control( 'intro', array( 'label' => 'Introduction', 'type' => Controls_Manager::TEXTAREA, 'rows' => 3, 'default' => $defaults['intro'] ) );
		}
	}

	protected function background_control( $default = 'plain' ) {
		$this->add_control( 'background', array(
			'label'   => 'Background',
			'type'    => Controls_Manager::SELECT,
			'options' => array( 'plain' => 'Ivory', 'alt' => 'Stone', 'navy' => 'Navy' ),
			'default' => $default,
		) );
		$this->add_control( 'anchor', array(
			'label'       => 'Section ID',
			'type'        => Controls_Manager::TEXT,
			'default'     => '',
			'description' => 'Used for menu links, e.g. “current” makes /#current scroll here.',
		) );
	}

	protected function section_open( $s, $extra_class = '' ) {
		$bg = array( 'alt' => ' section-alt', 'navy' => ' section-navy' )[ $s['background'] ?? '' ] ?? '';
		$id = ! empty( $s['anchor'] ) ? ' id="' . esc_attr( sanitize_title( $s['anchor'] ) ) . '"' : '';
		return '<section class="section' . $bg . ( $extra_class ? ' ' . esc_attr( $extra_class ) : '' ) . '"' . $id . '>';
	}

	protected function section_head( $s, $split = false ) {
		$light = ( $s['background'] ?? '' ) === 'navy' ? ' eyebrow-light' : '';
		$head  = ( $s['eyebrow'] ? '<p class="eyebrow' . $light . '">' . esc_html( $s['eyebrow'] ) . '</p>' : '' )
			. ( $s['heading'] ? '<h2 class="display">' . $this->heading_html( $s['heading'] ) . '</h2>' : '' );
		$intro = ! empty( $s['intro'] ) ? '<p class="section-intro">' . esc_html( $s['intro'] ) . '</p>' : '';
		if ( $split && $intro ) {
			return '<header class="section-head section-head-split" data-reveal><div>' . $head . '</div>' . $intro . '</header>';
		}
		return '<header class="section-head" data-reveal>' . $head . $intro . '</header>';
	}
}

/* =====================================================================
 * Home page sections
 * ===================================================================== */

class Premier_Widget_Hero extends Premier_Widget_Base {
	public function get_name() { return 'premier-hero'; }
	public function get_title() { return 'Heritage hero'; }
	public function get_icon() { return 'eicon-banner'; }

	protected function register_controls() {
		$this->start_controls_section( 'content', array( 'label' => 'Hero' ) );
		$this->add_control( 'image', array( 'label' => 'Background photo', 'type' => Controls_Manager::MEDIA ) );
		$this->add_control( 'eyebrow', array( 'label' => 'Small label', 'type' => Controls_Manager::TEXT, 'default' => 'Housebuilders · Swadlincote', 'label_block' => true ) );
		$this->add_control( 'title', array( 'label' => 'Heading', 'type' => Controls_Manager::TEXTAREA, 'rows' => 3, 'default' => 'Thoughtfully built homes, <em>rooted</em> in South Derbyshire', 'description' => 'Wrap a word in &lt;em&gt;…&lt;/em&gt; to set it in italic gold.' ) );
		$this->add_control( 'lede', array( 'label' => 'Text under the heading', 'type' => Controls_Manager::TEXTAREA, 'rows' => 2, 'default' => '' , 'description' => 'Leave blank to use the strapline from Company details.' ) );
		$this->add_control( 'button1_text', array( 'label' => 'Main button', 'type' => Controls_Manager::TEXT, 'default' => 'View current developments' ) );
		$this->add_control( 'button1_link', array( 'label' => 'Main button link', 'type' => Controls_Manager::URL, 'default' => array( 'url' => '#current' ) ) );
		$this->add_control( 'button2_text', array( 'label' => 'Second button', 'type' => Controls_Manager::TEXT, 'default' => 'Get in touch' ) );
		$this->add_control( 'button2_link', array( 'label' => 'Second button link', 'type' => Controls_Manager::URL, 'default' => array( 'url' => '#contact' ) ) );
		$this->add_control( 'show_selling', array( 'label' => 'Show “Now selling” strip', 'type' => Controls_Manager::SWITCHER, 'default' => 'yes' ) );
		$this->end_controls_section();
	}

	protected function render() {
		$s    = $this->get_settings_for_display();
		$img  = ! empty( $s['image']['id'] ) ? Premier_Render::img( $s['image']['id'], 'full', array( 'alt' => '', 'loading' => 'eager', 'fetchpriority' => 'high' ) )
			: ( ! empty( $s['image']['url'] ) ? '<img src="' . esc_url( $s['image']['url'] ) . '" alt="">' : '' );
		$lede = $s['lede'] ?: Premier_Data::company()['strapline'];
		$sell = 'yes' === $s['show_selling'] ? Premier_Render::now_selling_list( Premier_Data::developments( 'current' ) ) : '';
		echo '<section class="hero hero-home">'
			. '<div class="hero-media" aria-hidden="true">' . $img . '</div>' // phpcs:ignore WordPress.Security.EscapeOutput
			. '<div class="hero-shade" aria-hidden="true"></div>'
			. '<div class="wrap hero-content">'
			. ( $s['eyebrow'] ? '<p class="eyebrow eyebrow-light hero-fade" style="--d:.2s">' . esc_html( $s['eyebrow'] ) . '</p>' : '' )
			. '<h1 class="hero-title hero-fade" style="--d:.45s">' . $this->heading_html( $s['title'] ) . '</h1>' // phpcs:ignore WordPress.Security.EscapeOutput
			. ( $lede ? '<p class="hero-lede hero-fade" style="--d:.75s">' . esc_html( $lede ) . '</p>' : '' )
			. '<div class="hero-actions hero-fade" style="--d:1s">'
			. ( $s['button1_text'] ? '<a class="btn btn-gold"' . $this->link_attrs( $s['button1_link'] ) . '>' . esc_html( $s['button1_text'] ) . '</a>' : '' ) // phpcs:ignore WordPress.Security.EscapeOutput
			. ( $s['button2_text'] ? '<a class="btn btn-ghost-light"' . $this->link_attrs( $s['button2_link'] ) . '>' . esc_html( $s['button2_text'] ) . '</a>' : '' ) // phpcs:ignore WordPress.Security.EscapeOutput
			. '</div></div>'
			. ( $sell ? '<div class="hero-foot hero-fade" style="--d:1.3s"><div class="wrap hero-foot-inner"><span class="hero-foot-label">Now selling</span><ul class="hero-foot-list">' . $sell . '</ul></div></div>' : '' ) // phpcs:ignore WordPress.Security.EscapeOutput
			. '</section>';
	}
}

class Premier_Widget_Intro extends Premier_Widget_Base {
	public function get_name() { return 'premier-intro'; }
	public function get_title() { return 'Introduction & stats'; }
	public function get_icon() { return 'eicon-text'; }

	protected function register_controls() {
		$this->start_controls_section( 'content', array( 'label' => 'Introduction' ) );
		$this->section_controls( array( 'eyebrow' => 'Welcome to Premier Property', 'heading' => 'Small developments, finished to a standard we would live in ourselves' ) );
		$this->add_control( 'lead', array( 'label' => 'Lead paragraph', 'type' => Controls_Manager::TEXTAREA, 'rows' => 4, 'default' => '', 'description' => 'Leave blank to use “About (short)” from Company details.' ) );
		$this->add_control( 'text', array( 'label' => 'Second paragraph', 'type' => Controls_Manager::TEXTAREA, 'rows' => 4, 'default' => 'From a handful of village homes to generous detached family houses, every home is planned, built and finished by a local team who take real pride in the detail.' ) );
		$this->add_control( 'link_text', array( 'label' => 'Link text', 'type' => Controls_Manager::TEXT, 'default' => 'Our story' ) );
		$this->add_control( 'link', array( 'label' => 'Link', 'type' => Controls_Manager::URL, 'default' => array( 'url' => '#about' ) ) );
		$this->add_control( 'show_stats', array( 'label' => 'Show stats (from Company details)', 'type' => Controls_Manager::SWITCHER, 'default' => 'yes' ) );
		$this->background_control( 'plain' );
		$this->end_controls_section();
	}

	protected function render() {
		$s    = $this->get_settings_for_display();
		$lead = $s['lead'] ?: Premier_Data::company()['about'];
		echo $this->section_open( $s, 'intro' ) . '<div class="wrap"><div class="intro-grid">' // phpcs:ignore WordPress.Security.EscapeOutput
			. '<div data-reveal>' . ( $s['eyebrow'] ? '<p class="eyebrow">' . esc_html( $s['eyebrow'] ) . '</p>' : '' )
			. '<h2 class="display">' . $this->heading_html( $s['heading'] ) . '</h2></div>' // phpcs:ignore WordPress.Security.EscapeOutput
			. '<div class="intro-copy" data-reveal style="--i:1">'
			. ( $lead ? '<p class="lead">' . esc_html( $lead ) . '</p>' : '' )
			. ( $s['text'] ? '<p>' . esc_html( $s['text'] ) . '</p>' : '' )
			. ( $s['link_text'] ? '<a class="link-arrow draw"' . $this->link_attrs( $s['link'] ) . '>' . esc_html( $s['link_text'] ) . ' ' . Premier_Render::ARROW . '</a>' : '' ) // phpcs:ignore WordPress.Security.EscapeOutput
			. '</div></div>'
			. ( 'yes' === $s['show_stats'] ? Premier_Render::stats( Premier_Data::company()['stats'] ) : '' ) // phpcs:ignore WordPress.Security.EscapeOutput
			. '</div></section>';
	}
}

class Premier_Widget_Developments extends Premier_Widget_Base {
	public function get_name() { return 'premier-developments'; }
	public function get_title() { return 'Developments list'; }
	public function get_icon() { return 'eicon-posts-grid'; }

	protected function register_controls() {
		$this->start_controls_section( 'content', array( 'label' => 'Developments' ) );
		$this->add_control( 'stage', array(
			'label'   => 'Show',
			'type'    => Controls_Manager::SELECT,
			'options' => array( 'current' => 'Current developments', 'completed' => 'Completed developments', 'all' => 'All developments' ),
			'default' => 'current',
		) );
		$this->add_control( 'layout', array(
			'label'   => 'Layout',
			'type'    => Controls_Manager::SELECT,
			'options' => array( 'rows' => 'Large rows (image and text)', 'grid' => 'Grid of cards' ),
			'default' => 'rows',
		) );
		$this->section_controls( array( 'eyebrow' => 'Now selling', 'heading' => 'Current developments', 'intro' => 'Each of our developments is deliberately small — a considered collection of homes, rather than an estate. Explore what is available today.' ) );
		$this->background_control( 'alt' );
		$this->end_controls_section();
	}

	protected function render() {
		$s     = $this->get_settings_for_display();
		$stage = 'all' === $s['stage'] ? '' : $s['stage'];
		$list  = Premier_Data::developments( $stage );
		$body  = 'grid' === $s['layout'] ? Premier_Render::development_grid( $list ) : Premier_Render::development_rows( $list );
		echo $this->section_open( $s ) . '<div class="wrap">' . $this->section_head( $s, 'grid' === $s['layout'] ) . $body . '</div></section>'; // phpcs:ignore WordPress.Security.EscapeOutput
	}
}

class Premier_Widget_About extends Premier_Widget_Base {
	public function get_name() { return 'premier-about'; }
	public function get_title() { return 'About & principles'; }
	public function get_icon() { return 'eicon-info-box'; }

	protected function register_controls() {
		$this->start_controls_section( 'content', array( 'label' => 'About' ) );
		$this->add_control( 'image', array( 'label' => 'Photo', 'type' => Controls_Manager::MEDIA ) );
		$this->section_controls( array( 'eyebrow' => 'About Premier Property', 'heading' => 'A local name on every home we build' ) );
		$this->add_control( 'text', array( 'label' => 'Text', 'type' => Controls_Manager::TEXTAREA, 'rows' => 4, 'default' => '' ) );
		$rep = new Repeater();
		$rep->add_control( 'title', array( 'label' => 'Title', 'type' => Controls_Manager::TEXT, 'default' => 'Small by design' ) );
		$rep->add_control( 'text', array( 'label' => 'Text', 'type' => Controls_Manager::TEXTAREA, 'rows' => 3, 'default' => '' ) );
		$this->add_control( 'principles', array(
			'label'       => 'Principles',
			'type'        => Controls_Manager::REPEATER,
			'fields'      => $rep->get_controls(),
			'title_field' => '{{{ title }}}',
			'default'     => array(
				array( 'title' => 'Small by design', 'text' => 'Developments of a handful of homes, planned around green space, mature trees and the character of each village.' ),
				array( 'title' => 'Built locally', 'text' => 'A trusted team of local trades, many of whom have worked alongside us for years.' ),
				array( 'title' => 'Finished properly', 'text' => 'Every home is completed with a high specification throughout and backed by a 10 year new home warranty.' ),
			),
		) );
		$this->background_control( 'plain' );
		$this->end_controls_section();
	}

	protected function render() {
		$s     = $this->get_settings_for_display();
		$img   = ! empty( $s['image']['id'] ) ? Premier_Render::img( $s['image']['id'], 'large', array( 'alt' => '' ) ) : ( ! empty( $s['image']['url'] ) ? '<img src="' . esc_url( $s['image']['url'] ) . '" alt="">' : '' );
		$roman = array( 'I', 'II', 'III', 'IV', 'V', 'VI' );
		$items = '';
		foreach ( (array) $s['principles'] as $i => $p ) {
			$items .= '<li data-reveal><span class="principle-num">' . esc_html( $roman[ $i ] ?? (string) ( $i + 1 ) ) . '</span><div><h3>' . esc_html( $p['title'] ) . '</h3><p>' . esc_html( $p['text'] ) . '</p></div></li>';
		}
		echo $this->section_open( $s, 'about' ) . '<div class="wrap about-grid">' // phpcs:ignore WordPress.Security.EscapeOutput
			. ( $img ? '<figure class="about-media" data-reveal><div class="frame"><span class="frame-clip">' . $img . '</span></div></figure>' : '' ) // phpcs:ignore WordPress.Security.EscapeOutput
			. '<div class="about-copy">'
			. ( $s['eyebrow'] ? '<p class="eyebrow" data-reveal>' . esc_html( $s['eyebrow'] ) . '</p>' : '' )
			. '<h2 class="display" data-reveal>' . $this->heading_html( $s['heading'] ) . '</h2>' // phpcs:ignore WordPress.Security.EscapeOutput
			. ( $s['text'] ? '<p data-reveal>' . esc_html( $s['text'] ) . '</p>' : '' )
			. ( $items ? '<ol class="principles" data-stagger>' . $items . '</ol>' : '' ) // phpcs:ignore WordPress.Security.EscapeOutput
			. '</div></div></section>';
	}
}

class Premier_Widget_Contact extends Premier_Widget_Base {
	public function get_name() { return 'premier-contact'; }
	public function get_title() { return 'Contact details'; }
	public function get_icon() { return 'eicon-envelope'; }

	protected function register_controls() {
		$this->start_controls_section( 'content', array( 'label' => 'Contact' ) );
		$this->section_controls( array( 'eyebrow' => 'Contact', 'heading' => 'Arrange a viewing, or simply ask a question' ) );
		$this->add_control( 'lead', array( 'label' => 'Text', 'type' => Controls_Manager::TEXTAREA, 'rows' => 3, 'default' => 'Speak to the team directly. We are always happy to talk you through a development, a house type or what is coming next.' ) );
		$this->add_control( 'button', array( 'label' => 'Email button', 'type' => Controls_Manager::TEXT, 'default' => 'Email the team' ) );
		$this->add_control( 'note', array( 'type' => Controls_Manager::RAW_HTML, 'raw' => 'Phone numbers, email and address come from <strong>Company details</strong> in the WordPress menu.', 'content_classes' => 'elementor-descriptor' ) );
		$this->background_control( 'alt' );
		$this->end_controls_section();
	}

	protected function render() {
		$s = $this->get_settings_for_display();
		$c = Premier_Data::company();
		$rows = '';
		if ( $c['phone'] ) {
			$rows .= '<div data-reveal><dt>Office</dt><dd><a class="draw contact-big" href="' . esc_attr( Premier_Data::tel( $c['phone'] ) ) . '">' . esc_html( $c['phone'] ) . '</a></dd></div>';
		}
		if ( $c['mobile'] ) {
			$rows .= '<div data-reveal><dt>Mobile</dt><dd><a class="draw contact-big" href="' . esc_attr( Premier_Data::tel( $c['mobile'] ) ) . '">' . esc_html( $c['mobile'] ) . '</a></dd></div>';
		}
		if ( $c['email'] ) {
			$rows .= '<div data-reveal><dt>Email</dt><dd><a class="draw contact-email" href="mailto:' . esc_attr( $c['email'] ) . '">' . esc_html( $c['email'] ) . '</a></dd></div>';
		}
		if ( $c['address'] ) {
			$rows .= '<div data-reveal><dt>Address</dt><dd><address>' . implode( '<br>', array_map( 'esc_html', $c['address'] ) ) . '</address></dd></div>';
		}
		echo $this->section_open( $s, 'contact' ) . '<div class="wrap contact-grid">' // phpcs:ignore WordPress.Security.EscapeOutput
			. '<div data-reveal>' . ( $s['eyebrow'] ? '<p class="eyebrow">' . esc_html( $s['eyebrow'] ) . '</p>' : '' )
			. '<h2 class="display">' . $this->heading_html( $s['heading'] ) . '</h2>' // phpcs:ignore WordPress.Security.EscapeOutput
			. ( $s['lead'] ? '<p class="lead">' . esc_html( $s['lead'] ) . '</p>' : '' )
			. ( $s['button'] ? '<a class="btn btn-navy" href="' . esc_attr( Premier_Data::mailto( 'Enquiry from the website' ) ) . '">' . esc_html( $s['button'] ) . '</a>' : '' )
			. '</div><dl class="contact-list" data-stagger>' . $rows . '</dl></div></section>'; // phpcs:ignore WordPress.Security.EscapeOutput
	}
}

/* =====================================================================
 * Development components — for development pages / Theme Builder templates
 * ===================================================================== */

class Premier_Widget_Site_Plan extends Premier_Widget_Base {
	public function get_name() { return 'premier-site-plan'; }
	public function get_title() { return 'Interactive site plan'; }
	public function get_icon() { return 'eicon-map-pin'; }
	public function get_script_depends() { return array( 'premier-site-plan' ); }

	protected function register_controls() {
		$this->start_controls_section( 'content', array( 'label' => 'Site plan' ) );
		$this->development_control();
		$this->end_controls_section();
	}

	protected function render() {
		$d = $this->development();
		if ( ! $d || ! $d['site_plan'] ) {
			$this->placeholder( 'Interactive site plan: this development has no site plan image yet. Add one under Developments › Plots & site plan.' );
			return;
		}
		echo Premier_Render::site_plan( $d ); // phpcs:ignore WordPress.Security.EscapeOutput
	}
}

class Premier_Widget_Plots extends Premier_Widget_Base {
	public function get_name() { return 'premier-plots'; }
	public function get_title() { return 'Plot table'; }
	public function get_icon() { return 'eicon-table'; }

	protected function register_controls() {
		$this->start_controls_section( 'content', array( 'label' => 'Plot table' ) );
		$this->development_control();
		$this->end_controls_section();
	}

	protected function render() {
		$d = $this->development();
		if ( ! $d || ! $d['plots'] ) {
			$this->placeholder( 'Plot table: this development has no plots yet.' );
			return;
		}
		echo Premier_Render::availability( $d ); // phpcs:ignore WordPress.Security.EscapeOutput
	}
}

class Premier_Widget_House_Types extends Premier_Widget_Base {
	public function get_name() { return 'premier-house-types'; }
	public function get_title() { return 'House types'; }
	public function get_icon() { return 'eicon-gallery-grid'; }

	protected function register_controls() {
		$this->start_controls_section( 'content', array( 'label' => 'House types' ) );
		$this->development_control();
		$this->add_control( 'show_on_plan', array( 'label' => '“Show on plan” buttons', 'type' => Controls_Manager::SWITCHER, 'default' => '', 'description' => 'Turn on when the interactive site plan is on the same page.' ) );
		$this->end_controls_section();
	}

	protected function render() {
		$d = $this->development();
		if ( ! $d || ! $d['house_types'] ) {
			$this->placeholder( 'House types: no house types are linked to this development yet.' );
			return;
		}
		echo Premier_Render::house_type_cards( $d, array( 'show_on_plan' => 'yes' === $this->get_settings_for_display( 'show_on_plan' ) ) ); // phpcs:ignore WordPress.Security.EscapeOutput
	}
}

class Premier_Widget_Plots_Banner extends Premier_Widget_Base {
	public function get_name() { return 'premier-plots-banner'; }
	public function get_title() { return 'Plots page banner'; }
	public function get_icon() { return 'eicon-call-to-action'; }

	protected function register_controls() {
		$this->start_controls_section( 'content', array( 'label' => 'Banner' ) );
		$this->development_control();
		$this->end_controls_section();
	}

	protected function render() {
		$d = $this->development();
		if ( ! $d || ! $d['plots_url'] ) {
			$this->placeholder( 'Plots page banner: shown when the development has a site plan image.' );
			return;
		}
		echo Premier_Render::plan_cta( $d ); // phpcs:ignore WordPress.Security.EscapeOutput
	}
}
