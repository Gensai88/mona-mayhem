export interface ContributionDay {
	date: string;
	count: number;
	level: number;
	weekday?: number;
}

export interface ContributionData {
	username: string;
	from: string | null;
	to: string | null;
	total_contributions: number;
	range_days: number;
	colors_full: string[];
	weeks: Array<{
		index: number;
		first_day: string;
		contribution_days: ContributionDay[];
	}>;
	daily: ContributionDay[];
}

export interface PlayerMetrics {
	total: number;
	longestStreak: number;
	currentStreak: number;
	peakCount: number;
	peakDate: string;
	consistency: number;
	weekendShare: number;
	fighterClass: string;
	classDescription: string;
}

export interface BattleCategory {
	id: 'total' | 'longest' | 'current' | 'peak' | 'consistency';
	metric: keyof Pick<PlayerMetrics, 'total' | 'longestStreak' | 'currentStreak' | 'peakCount' | 'consistency'>;
	playerOneValue: number;
	playerTwoValue: number;
	winner: 1 | 2 | 'tie';
}

export interface BattleScore {
	playerOne: PlayerMetrics;
	playerTwo: PlayerMetrics;
	playerOneScore: number;
	playerTwoScore: number;
	winner: string | null;
	categories: BattleCategory[];
}

export function isValidGithubUsername(username: string): boolean {
	return /^[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,37}[a-zA-Z0-9])?$/.test(username);
}

export function normalizeContributionData(username: string, value: unknown): ContributionData {
	if (!value || typeof value !== 'object' || !Array.isArray((value as Record<string, unknown>).weeks)) {
		throw new TypeError('Malformed GitHub contribution payload.');
	}

	const payload = value as Record<string, unknown>;
	const weeks = (payload.weeks as unknown[]).map((value, index) => {
		const week = value && typeof value === 'object' ? (value as Record<string, unknown>) : {};
		const firstDay = typeof week.first_day === 'string' ? week.first_day : '';
		const days = Array.isArray(week.contribution_days) ? week.contribution_days : [];
		const contributionDays = days.map((value, dayIndex) => {
			const day = value && typeof value === 'object' ? (value as Record<string, unknown>) : {};
			const date = firstDay ? new Date(`${firstDay}T00:00:00Z`) : new Date(Date.UTC(2020, 0, 1));
			date.setUTCDate(date.getUTCDate() + dayIndex);

			return {
				date: date.toISOString().slice(0, 10),
				weekday: Number(day.weekday ?? dayIndex),
				count: Number(day.count ?? 0),
				level: Math.max(0, Math.min(4, Number(day.level ?? 0))),
			};
		});

		return { index, first_day: firstDay, contribution_days: contributionDays };
	});

	const daily = weeks.flatMap((week) => week.contribution_days);

	return {
		username,
		total_contributions: Number(payload.total_contributions ?? 0),
		from: typeof payload.from === 'string' ? payload.from : null,
		to: typeof payload.to === 'string' ? payload.to : null,
		range_days: Number(payload.range_days ?? 0),
		colors_full: Array.isArray(payload.colors_full) ? payload.colors_full.map(String) : [],
		weeks,
		daily,
	};
}

export function calculatePlayerMetrics(data: Pick<ContributionData, 'daily'>): PlayerMetrics {
	const days = data.daily.slice(-365);
	const counts = days.map((day) => (Number.isFinite(day.count) ? Math.max(0, day.count) : 0));
	let longestStreak = 0;
	let streak = 0;
	let peakIndex = 0;
	let total = 0;
	let weekendTotal = 0;
	let previousDate: Date | null = null;

	for (let index = 0; index < counts.length; index += 1) {
		const dayDate = new Date(`${days[index].date}T00:00:00Z`);
		if (previousDate && dayDate.getTime() - previousDate.getTime() !== 86_400_000) {
			streak = 0;
		}
		previousDate = dayDate;

		total += counts[index];
		const dayOfWeek = dayDate.getUTCDay();
		if (dayOfWeek === 0 || dayOfWeek === 6) weekendTotal += counts[index];

		if (counts[index] > 0) {
			streak += 1;
			longestStreak = Math.max(longestStreak, streak);
		} else {
			streak = 0;
		}

		if (counts[index] > counts[peakIndex]) peakIndex = index;
	}

	const weekendShare = total > 0 ? weekendTotal / total : 0;
	const peakCount = counts[peakIndex] ?? 0;
	let fighterClass = 'Contribution Mage';
	let classDescription = 'A versatile fighter with a balanced contribution pattern.';

	if (longestStreak > 30) {
		fighterClass = 'Streak Paladin';
		classDescription = `Forged by a ${longestStreak}-day contribution streak.`;
	} else if (peakCount >= 20) {
		fighterClass = 'Commit Berserker';
		classDescription = `Unleashed a peak of ${peakCount} contributions in one day.`;
	} else if (weekendShare >= 0.4 && weekendTotal > 0) {
		fighterClass = 'Weekend Warrior';
		classDescription = `${Math.round(weekendShare * 100)}% of contributions landed on weekends.`;
	}

	return {
		total,
		longestStreak,
		currentStreak: streak,
		peakCount,
		peakDate: days[peakIndex]?.date ?? '—',
		consistency: days.length ? (counts.filter((count) => count > 0).length / days.length) * 100 : 0,
		weekendShare,
		fighterClass,
		classDescription,
	};
}

export function scoreBattle(playerOne: ContributionData, playerTwo: ContributionData): BattleScore {
	const metrics = [calculatePlayerMetrics(playerOne), calculatePlayerMetrics(playerTwo)] as const;
	const definitions: Array<{ id: BattleCategory['id']; metric: BattleCategory['metric'] }> = [
		{ id: 'total', metric: 'total' },
		{ id: 'longest', metric: 'longestStreak' },
		{ id: 'current', metric: 'currentStreak' },
		{ id: 'peak', metric: 'peakCount' },
		{ id: 'consistency', metric: 'consistency' },
	];
	const scores = [0, 0];
	const categories = definitions.map(({ id, metric }) => {
		const playerOneValue = metrics[0][metric];
		const playerTwoValue = metrics[1][metric];
		const winner: BattleCategory['winner'] =
			playerOneValue > playerTwoValue ? 1 : playerTwoValue > playerOneValue ? 2 : 'tie';

		if (winner === 1) scores[0] += 1;
		else if (winner === 2) scores[1] += 1;
		else {
			scores[0] += 0.5;
			scores[1] += 0.5;
		}

		return { id, metric, playerOneValue, playerTwoValue, winner };
	});

	return {
		playerOne: metrics[0],
		playerTwo: metrics[1],
		playerOneScore: scores[0],
		playerTwoScore: scores[1],
		winner: scores[0] === scores[1] ? null : scores[0] > scores[1] ? playerOne.username : playerTwo.username,
		categories,
	};
}
