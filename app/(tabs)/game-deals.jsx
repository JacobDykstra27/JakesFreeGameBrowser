import { StyleSheet, View, FlatList, ActivityIndicator, Text } from "react-native";
import { useState, useEffect, useCallback } from "react";
import { GameCard } from "../../components/GameCard";
import { AddToWishlistModal } from "../../components/AddToWishlistModal";
import { on as onEvent } from "../../APIs/eventBus";
import { clearNamespaceCache } from "../../APIs/cacheStorage";
import { useWishlist } from "../../hooks/useWishlist";


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







	const handleAddToWishlist = (game) => {
		setSelectedGameForWishlist(game);
		setShowWishlistModal(true);
	};

	const handleSelectWishlist = async (wishlistId) => {
		if (game) {
			try {
				await addGameToWishlist(
					{
						id: game.id ,
						title: game.title,
						name: game.name,
						image: game.image,
						thumbnail: game.thumbnail,
						url: game.link,
						link: game.link,
						storeLink: game.link,
						steamAppID:
							game.steamAppID || null,
						price: game.price,
						salePrice: game.salePrice,
						normalPrice: game.normalPrice,
						worth: game.worth,
						store: game.storeName,
						storeName: game.storeName,
						dealID: game.dealID,
						storeID: game.storeID,
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












export default function GameDealsScreen() {
	const [deals, setDeals] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [showWishlistModal, setShowWishlistModal] = useState(false);
	const [selectedGameForWishlist, setSelectedGameForWishlist] = useState(null);
	const { wishlists, addGameToWishlist, createWishlist } = useWishlist();

	const loadGameDeals = useCallback(async () => {
		try {
			await initData({
				onSale: true,
				sortBy: "DealRating",
				desc: true,
				pageSize: 20,
			});
			setDeals(getDeals());
		} catch (e) {
			console.error("Error loading game deals:", e);
			setError(e.message || "Failed to load game deals");
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		loadGameDeals();
	}, []);





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



	else if (error) {
		return (
			<View style={styles.errorContainer}>
				<Text style={styles.errorText}>❌ {error}</Text>
				<Text style={styles.emptyText}>Try again in a moment</Text>
			</View>
		);
	}



	else if (deals.length === 0) {
		return (
			<View style={styles.emptyContainer}>
				<Text style={styles.emptyText}>No game deals available right now</Text>
			</View>
		);
	}


	else return (
			<View style={styles.container}>
				<FlatList
					data={deals}
					renderItem={({ item }) => (
						<GameCard deal={item} onAddToWishlist={handleAddToWishlist} />
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
