import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			fontFamily: {
				sans: ['Inter', 'sans-serif'],
				display: ['Space Grotesk', 'sans-serif'],
				mono: ['JetBrains Mono', 'monospace'],
			},
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))',
					glow: 'hsl(var(--primary-glow))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))',
					teal: 'hsl(var(--accent-teal))',
					purple: 'hsl(var(--accent-purple))',
					gold: 'hsl(var(--accent-gold))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				sidebar: {
					DEFAULT: 'hsl(var(--sidebar-background))',
					foreground: 'hsl(var(--sidebar-foreground))',
					primary: 'hsl(var(--sidebar-primary))',
					'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
					accent: 'hsl(var(--sidebar-accent))',
					'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
					border: 'hsl(var(--sidebar-border))',
					ring: 'hsl(var(--sidebar-ring))'
				}
			},
			backgroundImage: {
				'gradient-primary': 'var(--gradient-primary)',
				'gradient-hero': 'var(--gradient-hero)',
				'gradient-card': 'var(--gradient-card)',
				'gradient-accent': 'var(--gradient-accent)',
				'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
				'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
			},
			boxShadow: {
				'primary': 'var(--shadow-primary)',
				'teal': 'var(--shadow-teal)',
				'card': 'var(--shadow-card)',
				'glow': 'var(--shadow-glow)',
				'inner': 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
			},
			transitionTimingFunction: {
				'smooth': 'var(--transition-smooth)',
				'bounce': 'var(--transition-bounce)',
				'spring': 'var(--transition-spring)',
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			keyframes: {
				'accordion-down': {
					from: { height: '0' },
					to: { height: 'var(--radix-accordion-content-height)' }
				},
				'accordion-up': {
					from: { height: 'var(--radix-accordion-content-height)' },
					to: { height: '0' }
				},
				'fade-in': {
					'0%': { opacity: '0', transform: 'translateY(10px)' },
					'100%': { opacity: '1', transform: 'translateY(0)' }
				},
				'slide-in-right': {
					'0%': { transform: 'translateX(100%)' },
					'100%': { transform: 'translateX(0)' }
				},
				'slide-in-left': {
					'0%': { transform: 'translateX(-100%)' },
					'100%': { transform: 'translateX(0)' }
				},
				'slide-up': {
					'0%': { opacity: '0', transform: 'translateY(20px)' },
					'100%': { opacity: '1', transform: 'translateY(0)' }
				},
				'scale-in': {
					'0%': { opacity: '0', transform: 'scale(0.95)' },
					'100%': { opacity: '1', transform: 'scale(1)' }
				},
				'pulse-glow': {
					'0%, 100%': { transform: 'scale(1)', opacity: '0.8' },
					'50%': { transform: 'scale(1.05)', opacity: '1' }
				},
				'float': {
					'0%, 100%': { transform: 'translateY(0px)' },
					'50%': { transform: 'translateY(-10px)' }
				},
				'bounce-gentle': {
					'0%, 100%': { transform: 'translateY(0)' },
					'50%': { transform: 'translateY(-5px)' }
				},
				'gradient-shift': {
					'0%': { backgroundPosition: '0% 50%' },
					'50%': { backgroundPosition: '100% 50%' },
					'100%': { backgroundPosition: '0% 50%' }
				},
				'shimmer': {
					'0%': { backgroundPosition: '-200% 0' },
					'100%': { backgroundPosition: '200% 0' }
				},
				'wiggle': {
					'0%, 100%': { transform: 'rotate(-3deg)' },
					'50%': { transform: 'rotate(3deg)' }
				},
				'heartbeat': {
					'0%, 100%': { transform: 'scale(1)' },
					'50%': { transform: 'scale(1.1)' }
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'fade-in': 'fade-in 0.6s ease-out',
				'slide-in-right': 'slide-in-right 0.3s ease-out',
				'slide-in-left': 'slide-in-left 0.3s ease-out',
				'slide-up': 'slide-up 0.5s ease-out',
				'scale-in': 'scale-in 0.3s ease-out',
				'pulse-glow': 'pulse-glow 3s ease-in-out infinite',
				'float': 'float 6s ease-in-out infinite',
				'bounce-gentle': 'bounce-gentle 2s infinite',
				'gradient-shift': 'gradient-shift 15s ease infinite',
				'shimmer': 'shimmer 1.5s infinite',
				'wiggle': 'wiggle 1s ease-in-out infinite',
				'heartbeat': 'heartbeat 2s ease-in-out infinite'
			},
			spacing: {
				'18': '4.5rem',
				'88': '22rem',
				'128': '32rem',
			},
			zIndex: {
				'60': '60',
				'70': '70',
				'80': '80',
				'90': '90',
				'100': '100',
			},
			backdropBlur: {
				xs: '2px',
			},
			typography: {
				DEFAULT: {
					css: {
						maxWidth: 'none',
						color: 'hsl(var(--foreground))',
						'[class~="lead"]': {
							color: 'hsl(var(--muted-foreground))',
						},
						a: {
							color: 'hsl(var(--primary))',
							textDecoration: 'underline',
							fontWeight: '500',
						},
						strong: {
							color: 'hsl(var(--foreground))',
							fontWeight: '600',
						},
						'ol[type="A"]': {
							'--list-counter-style': 'upper-alpha',
						},
						'ol[type="a"]': {
							'--list-counter-style': 'lower-alpha',
						},
						'ol[type="A" s]': {
							'--list-counter-style': 'upper-alpha',
						},
						'ol[type="a" s]': {
							'--list-counter-style': 'lower-alpha',
						},
						'ol[type="I"]': {
							'--list-counter-style': 'upper-roman',
						},
						'ol[type="i"]': {
							'--list-counter-style': 'lower-roman',
						},
						'ol[type="I" s]': {
							'--list-counter-style': 'upper-roman',
						},
						'ol[type="i" s]': {
							'--list-counter-style': 'lower-roman',
						},
						'ol[type="1"]': {
							'--list-counter-style': 'decimal',
						},
						'ol > li': {
							position: 'relative',
						},
						'ol > li::marker': {
							fontWeight: '400',
							color: 'hsl(var(--muted-foreground))',
						},
						'ul > li': {
							position: 'relative',
						},
						'ul > li::marker': {
							color: 'hsl(var(--muted-foreground))',
						},
						hr: {
							borderColor: 'hsl(var(--border))',
							borderTopWidth: 1,
						},
						blockquote: {
							fontWeight: '500',
							fontStyle: 'italic',
							color: 'hsl(var(--foreground))',
							borderLeftWidth: '0.25rem',
							borderLeftColor: 'hsl(var(--border))',
							quotes: '"\\201C""\\201D""\\2018""\\2019"',
						},
						h1: {
							color: 'hsl(var(--foreground))',
							fontWeight: '800',
						},
						h2: {
							color: 'hsl(var(--foreground))',
							fontWeight: '700',
						},
						h3: {
							color: 'hsl(var(--foreground))',
							fontWeight: '600',
						},
						h4: {
							color: 'hsl(var(--foreground))',
							fontWeight: '600',
						},
						'figure figcaption': {
							color: 'hsl(var(--muted-foreground))',
						},
						code: {
							color: 'hsl(var(--foreground))',
							fontWeight: '600',
						},
						'code::before': {
							content: '"`"',
						},
						'code::after': {
							content: '"`"',
						},
						'a code': {
							color: 'hsl(var(--primary))',
						},
						pre: {
							color: 'hsl(var(--foreground))',
							backgroundColor: 'hsl(var(--muted))',
							overflowX: 'auto',
							fontWeight: '400',
							fontSize: '0.875em',
							lineHeight: '1.7142857',
							marginTop: '1.7142857em',
							marginBottom: '1.7142857em',
							borderRadius: '0.375rem',
							paddingTop: '0.8571429em',
							paddingRight: '1.1428571em',
							paddingBottom: '0.8571429em',
							paddingLeft: '1.1428571em',
						},
						'pre code': {
							backgroundColor: 'transparent',
							borderWidth: '0',
							borderRadius: '0',
							padding: '0',
							fontWeight: '400',
							color: 'inherit',
							fontSize: 'inherit',
							fontFamily: 'inherit',
							lineHeight: 'inherit',
						},
						'pre code::before': {
							content: 'none',
						},
						'pre code::after': {
							content: 'none',
						},
						table: {
							width: '100%',
							tableLayout: 'auto',
							textAlign: 'left',
							marginTop: '2em',
							marginBottom: '2em',
						},
						thead: {
							color: 'hsl(var(--foreground))',
							fontWeight: '600',
							borderBottomWidth: '1px',
							borderBottomColor: 'hsl(var(--border))',
						},
						'thead th': {
							verticalAlign: 'bottom',
							paddingRight: '0.5714286em',
							paddingBottom: '0.5714286em',
							paddingLeft: '0.5714286em',
						},
						'tbody tr': {
							borderBottomWidth: '1px',
							borderBottomColor: 'hsl(var(--border))',
						},
						'tbody tr:last-child': {
							borderBottomWidth: '0',
						},
						'tbody td': {
							verticalAlign: 'baseline',
						},
						tfoot: {
							borderTopWidth: '1px',
							borderTopColor: 'hsl(var(--border))',
						},
						'tfoot td': {
							verticalAlign: 'top',
						},
						video: {
							color: 'inherit',
						},
						[`@media (max-width: 640px)`]: {
							table: {
								fontSize: '0.875em',
							},
						},
						[`@media (max-width: 1024px)`]: {
							table: {
								fontSize: '0.875em',
							},
						},
					},
				},
			},
		}
	},
	plugins: [require("tailwindcss-animate"), require("@tailwindcss/typography")],
} satisfies Config;
