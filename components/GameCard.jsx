import { StyleSheet, View, Text, TouchableOpacity, Image } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as WebBrowser from "expo-web-browser";
import { useState, useEffect } from "react";
import { isDebugMode } from "../APIs/debugMode";
import { on as onEvent } from "../APIs/eventBus";
import GameDebugModal from "./GameDebugModal";
import {getGame} from "../APIs/getCheapSharkAPIs";

const styles = StyleSheet.create({
	card: {
		backgroundColor: "#2a2a2a",
		borderRadius: 8,
		marginBottom: 12,
		overflow: "hidden",
		shadowColor: "#000",
		shadowOpacity: 0.3,
		shadowRadius: 4,
		elevation: 5,
	},
	cardImage: {
		width: "100%",
		height: 150,
		backgroundColor: "#1a1a1a",
	},
	imageButton: {
		width: "100%",
	},
	cardContent: {
		padding: 12,
	},
	cardTitle: {
		fontSize: 16,
		fontWeight: "bold",
		color: "#fff",
		marginBottom: 6,
	},
	cardSubtitle: {
		fontSize: 12,
		color: "#aaa",
		marginBottom: 8,
	},
	cardFooter: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
	},
	priceTag: {
		paddingHorizontal: 12,
		paddingVertical: 6,
		backgroundColor: "#007AFF",
		borderRadius: 4,
	},
	priceText: {
		color: "#fff",
		fontWeight: "bold",
		fontSize: 14,
	},
	linkButton: {
		paddingHorizontal: 12,
		paddingVertical: 6,
		backgroundColor: "#444",
		borderRadius: 4,
		flexDirection: "row",
		alignItems: "center",
		gap: 6,
	},
	linkButtonText: {
		color: "#fff",
		fontWeight: "600",
		fontSize: 12,
	},
	tagsContainer: {
		flexDirection: "row",
		gap: 6,
		marginBottom: 8,
		flexWrap: "wrap",
	},
	tag: {
		backgroundColor: "#1a4d80",
		paddingHorizontal: 8,
		paddingVertical: 4,
		borderRadius: 4,
	},
	tagText: {
		color: "#80c0ff",
		fontSize: 11,
	},
});

export function GameCard({ deal, onAddToWishlist, showPrice = true }) {

	const [debugEnabled, setDebugEnabled] = useState(isDebugMode());
	const [debugVisible, setDebugVisible] = useState(false);
	let game = getGame(deal.gameID);
	let imageUrl = game.imageUrl;
	let title = game.title;
	let genresList = game.genresList;


	useEffect(() => {
		const unsub = onEvent("debug_mode_changed", (val) => {
			setDebugEnabled(Boolean(val));
		});
		return () => unsub && unsub();
	}, []);

	const handleOpenLink = async () => {
		if (deal.gameLink) {
			await WebBrowser.openBrowserAsync(deal.gameLink);
		}
	};	

	return (
		<View style={styles.card}>
			{imageUrl && (
				<TouchableOpacity
					style={styles.imageButton}
					onPress={handleOpenLink}
					activeOpacity={0.85}
					disabled={!deal.gameLink}
				>
					<Image
						source={{ uri:imageUrl }}
						style={styles.cardImage}
						resizeMode="cover"
						onError={() => {
							// Image will show placeholder color if load fails
							}}
					/>
				</TouchableOpacity>
			)}

			<View style={styles.cardContent}>
				<Text style={styles.cardTitle} numberOfLines={2}>
					{title}
				</Text>

				{(genresList.length > 0 || deal.store) && (
					<View style={styles.tagsContainer}>
						{genresList.map((genre) => (
							<View key={genre.id} style={styles.tag}>
								<Text style={styles.tagText}>{genre.name}</Text>
							</View>
						))}

						{deal.store?.name && (
							<View style={styles.tag}>
								<Text style={styles.tagText}>{deal.store.name}</Text>
							</View>
						)}
					</View>
				)}

				<View style={styles.cardFooter}>
					<View style={styles.priceTag}>
						<Text style={styles.priceText}>{String(deal.salePrice)}</Text>
					</View>


					<TouchableOpacity style={styles.linkButton} onPress={handleOpenLink}>
						<MaterialCommunityIcons name="open-in-new" size={14} color="#fff" />
						<Text style={styles.linkButtonText}>Visit</Text>
					</TouchableOpacity>

					{onAddToWishlist && (
						<TouchableOpacity onPress={() => onAddToWishlist(deal.game)}>
							<MaterialCommunityIcons name="heart-outline" size={20} color="#ff6b6b" />
						</TouchableOpacity>
					)}

					{debugEnabled && (
						<>
							<TouchableOpacity onPress={() => setDebugVisible(true)} style={{ marginLeft: 8 }}>
								<MaterialCommunityIcons name="code-tags" size={20} color="#80ff80" />
							</TouchableOpacity>
							<GameDebugModal visible={debugVisible} onClose={() => setDebugVisible(false)} data={deal.game} title={title} />
						</>
					)}
				</View>
			</View>
		</View>
	);
}

export default GameCard;
