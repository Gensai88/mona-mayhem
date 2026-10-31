export interface ArcadeSfx {
	playCoin(): void;
	playPowerUp(): void;
	playHit(): void;
	playVictory(isTie: boolean): void;
}

export function createArcadeSfx(toggleButton: HTMLButtonElement | null): ArcadeSfx {
	let audioContext: AudioContext | null = null;
	let masterGain: GainNode | null = null;
	let muted = false;

	function updateToggle() {
		if (!toggleButton) return;
		toggleButton.textContent = `🔊 SFX: ${muted ? 'OFF' : 'ON'}`;
		toggleButton.setAttribute('aria-pressed', String(!muted));
		toggleButton.setAttribute('aria-label', 'Sound effects');
	}

	toggleButton?.addEventListener('click', () => {
		muted = !muted;
		if (masterGain && audioContext) {
			masterGain.gain.setTargetAtTime(muted ? 0 : 0.55, audioContext.currentTime, 0.015);
		}
		updateToggle();
	});
	updateToggle();

	function withAudio(schedule: (context: AudioContext, startAt: number) => void) {
		if (muted) return;

		try {
			if (!audioContext) {
				audioContext = new AudioContext();
				masterGain = audioContext.createGain();
				masterGain.gain.value = 0.55;
				masterGain.connect(audioContext.destination);
			}

			const context = audioContext;
			const destination = masterGain;
			if (!context || !destination) return;

			const play = () => schedule(context, context.currentTime + 0.015);
			if (context.state === 'suspended') {
				void context.resume().then(play).catch((error: unknown) => {
					console.warn('Unable to resume arcade sound effects:', error);
				});
			} else {
				play();
			}
		} catch (error) {
			console.warn('Unable to initialize arcade sound effects:', error);
		}
	}

	function tone(
		context: AudioContext,
		frequency: number,
		startAt: number,
		duration: number,
		options: { type?: OscillatorType; endFrequency?: number; volume?: number } = {},
	) {
		const oscillator = context.createOscillator();
		const gain = context.createGain();
		const endAt = startAt + duration;

		oscillator.type = options.type ?? 'square';
		oscillator.frequency.setValueAtTime(frequency, startAt);
		if (options.endFrequency) {
			oscillator.frequency.exponentialRampToValueAtTime(options.endFrequency, endAt);
		}

		gain.gain.setValueAtTime(0.0001, startAt);
		gain.gain.exponentialRampToValueAtTime(options.volume ?? 0.22, startAt + 0.008);
		gain.gain.exponentialRampToValueAtTime(0.0001, endAt);
		oscillator.connect(gain);
		gain.connect(masterGain!);
		oscillator.start(startAt);
		oscillator.stop(endAt + 0.01);
	}

	return {
		playCoin() {
			withAudio((context, startAt) => {
				tone(context, 988, startAt, 0.08, { volume: 0.18 });
				tone(context, 1318, startAt + 0.075, 0.13, { volume: 0.2 });
			});
		},

		playPowerUp() {
			withAudio((context, startAt) => {
				[392, 494, 587, 784, 988, 1175].forEach((frequency, index) => {
					tone(context, frequency, startAt + index * 0.105, 0.14, {
						type: 'triangle',
						volume: 0.16,
					});
				});
			});
		},

		playHit() {
			withAudio((context, startAt) => {
				tone(context, 165, startAt, 0.11, { endFrequency: 68, volume: 0.3 });
				tone(context, 740, startAt, 0.045, { volume: 0.13 });
			});
		},

		playVictory(isTie) {
			withAudio((context, startAt) => {
				const melody = isTie
					? [523, 659, 587, 523]
					: [523, 659, 784, 1047, 784, 1047];
				melody.forEach((frequency, index) => {
					tone(context, frequency, startAt + index * 0.14, 0.19, {
						type: index % 2 === 0 ? 'square' : 'triangle',
						volume: 0.2,
					});
				});
				if (!isTie) {
					tone(context, 1318, startAt + melody.length * 0.14, 0.42, {
						type: 'triangle',
						volume: 0.22,
					});
				}
			});
		},
	};
}
