import React from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { GlassNavbar } from '@/components/GlassNavbar';
import { PaperShaderBackground } from '@/components/PaperShaderBackground';
import { Activity, Eye, Mic, ArrowRight } from 'lucide-react';

const labs = [
	{
		id: 'motor',
		title: 'Motor & Tremor Lab',
		description: 'Measure movement patterns, tremor frequency, and motor control',
		icon: Activity,
		status: 'ready',
		features: ['Finger Tapping', 'Tremor Analysis', 'Movement Speed', 'Coordination'],
	},
	{
		id: 'voice',
		title: 'Voice & Speech Lab',
		description: 'Analyze vocal patterns, pitch stability, and speech characteristics',
		icon: Mic,
		status: 'ready',
		features: ['Pitch Analysis', 'Jitter Detection', 'Voice Quality', 'Speech Patterns'],
	},
	{
		id: 'eye',
		title: 'Eye & Cognition Lab',
		description: 'Test reaction times, visual attention, and cognitive processing',
		icon: Eye,
		status: 'ready',
		features: ['Saccade Tests', 'Reaction Time', 'Stroop Test', 'Visual Attention'],
	},
];

const LabsPage = () => {
	const location = useLocation();
	const isLabDetail = location.pathname.split('/').length > 2;

	if (isLabDetail) {
		return (
			<div className="min-h-screen">
				<PaperShaderBackground />
				<GlassNavbar showBack />
				<main className="container mx-auto px-4 py-8">
					<Outlet />
				</main>
			</div>
		);
	}

	return (
		<div className="min-h-screen">
			<PaperShaderBackground />
			<GlassNavbar />
			<main className="container mx-auto px-6 py-24">
				<div className="text-center mb-12">
					<h1 className="text-5xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
						NeuroScan Bench
					</h1>
					<p className="text-xl text-gray-300 mt-4">Select a lab to begin your session.</p>
				</div>
				<div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-10">
					{labs.map((lab) => {
						const IconComponent = lab.icon;
						return (
							<Link to={`/labs/${lab.id}`} key={lab.id}>
								<Card className="paper-module group cursor-pointer hover:scale-105 transition-transform duration-300">
									<CardHeader className="pb-6">
										<div className="flex items-center justify-between mb-4">
											<div className="p-3 rounded-2xl bg-gradient-to-br from-purple-500/10 to-purple-500/20">
												<IconComponent className="w-10 h-10 text-purple-400" />
											</div>
											<Badge className="bg-green-500/10 text-green-400 border-green-500/20 text-sm px-3 py-1">
												{lab.status}
											</Badge>
										</div>
										<CardTitle className="group-hover:text-purple-400 transition-colors text-2xl text-white">
											{lab.title}
										</CardTitle>
										<CardDescription className="text-lg leading-relaxed text-gray-300">
											{lab.description}
										</CardDescription>
									</CardHeader>
									<CardContent>
										<div className="space-y-4">
											<div className="flex flex-wrap gap-2">
												{lab.features.map((feature) => (
													<Badge
														key={feature}
														variant="outline"
														className="text-sm px-3 py-1 border-gray-600 text-gray-300"
													>
														{feature}
													</Badge>
												))}
											</div>
											<Button
												className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
												size="lg"
											>
												Launch Lab
												<ArrowRight className="ml-2 h-5 w-5" />
											</Button>
										</div>
									</CardContent>
								</Card>
							</Link>
						);
					})}
				</div>
			</main>
		</div>
	);
};

export default LabsPage;
