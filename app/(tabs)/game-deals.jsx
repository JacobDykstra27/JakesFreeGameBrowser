import { StyleSheet, View, FlatList, ActivityIndicator, Text } from "react-native";
import { useState, useEffect, useCallback } from "react";
import { GameCard } from "../../components/GameCard";
import { AddToWishlistModal } from "../../components/AddToWishlistModal";
import { on as onEvent } from "../../APIs/eventBus";
import { useCheapShark } from "../../hooks/useCheapShark";
import { buildGameStoreUrl } from "../../APIs/getCheapSharkAPIs";
import { clearNamespaceCache } from "../../APIs/cacheStorage";
import { useWishlist } from "../../hooks/useWishlist";

const STORE_NAMES = {
	1: "Steam",
	2: "GamersGate",
	3: "GreenManGaming",
	4: "Amazon",
	5: "GameStop",
	6: "Direct2Drive",
	7: "GOG",
	8: "Origin",
	9: "Get Games",
	10: "Shiny Loot",
	11: "Humble Store",
	12: "Desura",
	13: "Uplay",
	14: "IndieGameStand",
	15: "Fanatical",
	16: "GamesRocket",
	17: "Games Republic",
	18: "Sila Games",
	19: "Playfield",
	20: "ImperialGames",
	21: "WinGameStore",
	22: "FunStockDigital",
	23: "GameBillet",
	24: "Voidu",
	25: "Epic Games Store",
	26: "Razer Game Store",
	27: "Gamesplanet",
	28: "Gamesload",
	29: "2Game",
	30: "IndieGala",
	31: "Blizzard Shop",
	32: "AllYouPlay",
	33: "DLGamer",
	34: "Noctre",
	35: "DreamGame"
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#1a1a1a",
		paddingHorizontal: 12,
		paddingTop: 12,
	},
	header: {
		flexDirection: "row",
		justifyContent: "flex-end",
		paddingHorizontal: 8,
		paddingVertical: 8,
		marginBottom: 4,
	},
	listContent: {
		paddingBottom: 20,
	},
	loadingContainer: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
	},
	errorContainer: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		paddingHorizontal: 20,
	},
	errorText: {
		color: "#ff6b6b",
		fontSize: 16,
		textAlign: "center",
		marginBottom: 16,
	},
	emptyContainer: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		paddingHorizontal: 20,
	},
	emptyText: {
		color: "#aaa",
		fontSize: 16,
		textAlign: "center",
	},
	infoText: {
		color: "#999",
		fontSize: 12,
		marginTop: 8,
		textAlign: "center",
	},
});

export default function GameDealsScreen() {
	const [games, setGames] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [showWishlistModal, setShowWishlistModal] = useState(false);
	const [selectedGameForWishlist, setSelectedGameForWishlist] = useState(null);
	const { fetchDeals } = useCheapShark();
	const { wishlists, addGameToWishlist, createWishlist } = useWishlist();

	const loadGameDeals = useCallback(async () => {
		try {
			setLoading(true);
			setError(null);

			const deals = await fetchDeals({
				onSale: true,
				sortBy: "DealRating",
				desc: true,
				pageSize: 20,
			});

			const normalizedDeals = deals.map((deal) => ({
				...deal,
				id: deal.dealID,
				title: deal.title,
				name: deal.title,
				image: deal.thumb,
				thumbnail: deal.thumb,
				price: `$${Number(deal.salePrice).toFixed(2)}`,
				salePrice: deal.salePrice,
				normalPrice: deal.normalPrice,
				worth: `$${Number(deal.normalPrice).toFixed(2)}`,
				link: buildGameStoreUrl(deal),
				storeLink: buildGameStoreUrl(deal),
				storeName: STORE_NAMES[Number(deal.storeID)] || `Store ${deal.storeID}`,
				source: "CheapShark",
				addedAt: new Date().toISOString(),
			}));

			setGames(normalizedDeals);
		} catch (e) {
			console.error("Error loading game deals:", e);
			setError(e.message || "Failed to load game deals");
		} finally {
			setLoading(false);
		}
	}, [fetchDeals]);

	useEffect(() => {
		loadGameDeals();
	}, [loadGameDeals]);

	const handleAddToWishlist = (game) => {
		setSelectedGameForWishlist(game);
		setShowWishlistModal(true);
	};

	const handleSelectWishlist = async (wishlistId) => {
		if (selectedGameForWishlist) {
			try {
				await addGameToWishlist(
					{
						id: selectedGameForWishlist.id || selectedGameForWishlist.dealID,
						title: selectedGameForWishlist.title,
						name: selectedGameForWishlist.name,
						image: selectedGameForWishlist.image,
						thumbnail: selectedGameForWishlist.thumbnail,
						url: selectedGameForWishlist.link,
						link: selectedGameForWishlist.link,
						storeLink: selectedGameForWishlist.link,
						steamAppID:
							selectedGameForWishlist.steamAppID ||
							selectedGameForWishlist.steamAppId ||
							selectedGameForWishlist.steam_app_id ||
							null,
						price: selectedGameForWishlist.price,
						salePrice: selectedGameForWishlist.salePrice,
						normalPrice: selectedGameForWishlist.normalPrice,
						worth: selectedGameForWishlist.worth,
						store: selectedGameForWishlist.storeName,
						storeName: selectedGameForWishlist.storeName,
						dealID: selectedGameForWishlist.dealID,
						storeID: selectedGameForWishlist.storeID,
						source: "CheapShark",
						addedAt: new Date().toISOString(),
					},
					wishlistId,
				);
				setShowWishlistModal(false);
				setSelectedGameForWishlist(null);
			} catch (err) {
				console.error("Error adding game to wishlist:", err);
			}
		}
	};

	const handleCreateNewWishlist = async (name) => {
		try {
			const newWishlist = await createWishlist(name, "");
			await handleSelectWishlist(newWishlist.id);
		} catch (err) {
			console.error("Error creating new wishlist:", err);
			throw err;
		}
	};

	const handleRefresh = async () => {
		try {
			await clearNamespaceCache("cheapshark");
			await loadGameDeals();
		} catch (err) {
			console.error("Error refreshing deals:", err);
		}
	};

	// Subscribe to header refresh event
	useEffect(() => {
		const unsub = onEvent("refresh_game_deals", () => {
			handleRefresh();
		});
		return () => unsub && unsub();
	}, [loadGameDeals]);

	if (loading) {
		return (
			<View style={styles.loadingContainer}>
				<ActivityIndicator size="large" color="#007AFF" />
			</View>
		);
	}

	if (error) {
		return (
			<View style={styles.errorContainer}>
				<Text style={styles.errorText}>❌ {error}</Text>
				<Text style={styles.emptyText}>Try again in a moment</Text>
			</View>
		);
	}

	if (games.length === 0) {
		return (
			<View style={styles.emptyContainer}>
				<Text style={styles.emptyText}>No game deals available right now</Text>
			</View>
		);
	}

	return (
		<View style={styles.container}>
			<FlatList
				data={games}
				renderItem={({ item }) => (
					<GameCard game={item} onAddToWishlist={handleAddToWishlist} />
				)}
				keyExtractor={(item) => item.id.toString()}
				contentContainerStyle={styles.listContent}
				scrollIndicatorInsets={{ right: 1 }}
			/>
			<AddToWishlistModal
				visible={showWishlistModal}
				wishlists={wishlists}
				onSelectWishlist={handleSelectWishlist}
				onCreateNew={handleCreateNewWishlist}
				onCancel={() => {
					setShowWishlistModal(false);
					setSelectedGameForWishlist(null);
				}}
			/>
		</View>
	);
}
