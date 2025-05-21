import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { collection, addDoc, getDocs, query, where, orderBy } from 'firebase/firestore';
import { FIREBASE_DB } from '../../FirebaseConfig'; // Adjust the import based on your project structure

interface Review {
  id?: string;
  productId: string;
  userName: string;
  rating: number;
  comment: string;
  date: Date;
}

interface ReviewsSectionProps {
  productId: string;
}

const ReviewsSection = ({ productId }: ReviewsSectionProps) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [newReview, setNewReview] = useState({ userName: '', rating: 5, comment: '' });
  const [showReviewForm, setShowReviewForm] = useState(false);

  useEffect(() => {
    fetchReviews();
  }, [productId]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const q = query(
        collection(FIREBASE_DB, 'reviews'), 
        where('productId', '==', productId),
        orderBy('date', 'desc')
      );
      const querySnapshot = await getDocs(q);
      
      const reviewsData: Review[] = [];
      querySnapshot.forEach((doc) => {
        reviewsData.push({ 
          id: doc.id, 
          ...doc.data() as Review 
        });
      });
      
      setReviews(reviewsData);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching reviews:', error);
      setLoading(false);
    }
  };

  const submitReview = async () => {
    console.log('inside');
    if (!newReview.userName || !newReview.comment) return;
    console.log('checkpoint');
    try {
      const reviewData = {
        productId,
        userName: newReview.userName,
        rating: newReview.rating,
        comment: newReview.comment,
        date: new Date()
      };
      
      await addDoc(collection(FIREBASE_DB, 'reviews'), reviewData);
      setNewReview({ userName: '', rating: 5, comment: '' });
      setShowReviewForm(false);
      fetchReviews();
    } catch (error) {
      console.error('Error adding review:', error);
    }
  };

  const renderReview = ({ item }: { item: Review }) => (
    <View style={styles.reviewItem}>
      <Text style={styles.reviewUserName}>{item.userName}</Text>
      <View style={styles.ratingContainer}>
        {/* Render stars based on rating */}
        {Array(5).fill(0).map((_, i) => (
          <Ionicons 
            key={i} 
            name={i < item.rating ? "star" : "star-outline"} 
            size={16} 
            color="#FFD700" 
          />
        ))}
      </View>
      <Text style={styles.reviewDate}>{new Date(item.date).toLocaleDateString()}</Text>
      <Text style={styles.reviewComment}>{item.comment}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Customer Reviews</Text>
        <TouchableOpacity 
          style={styles.addReviewButton} 
          onPress={() => setShowReviewForm(!showReviewForm)}
        >
          <Text style={styles.addReviewButtonText}>
            {showReviewForm ? 'Cancel' : 'Write Review'}
          </Text>
        </TouchableOpacity>
      </View>
      
      {showReviewForm && (
        <View style={styles.reviewForm}>
          <TextInput 
            style={styles.input}
            placeholder="Your Name"
            value={newReview.userName}
            onChangeText={(text) => setNewReview({...newReview, userName: text})}
          />
          <View style={styles.ratingInput}>
            <Text>Your Rating: </Text>
            <View style={styles.starContainer}>
              {Array(5).fill(0).map((_, i) => (
                <TouchableOpacity 
                  key={i}
                  onPress={() => setNewReview({...newReview, rating: i + 1})}
                >
                  <Ionicons 
                    name={i < newReview.rating ? "star" : "star-outline"} 
                    size={24} 
                    color="#FFD700" 
                    style={styles.starIcon}
                  />
                </TouchableOpacity>
              ))}
            </View>
          </View>
          <TextInput 
            style={[styles.input, styles.commentInput]}
            placeholder="Your Review"
            value={newReview.comment}
            onChangeText={(text) => setNewReview({...newReview, comment: text})}
            multiline={true}
          />
          <TouchableOpacity 
            style={styles.submitButton}
            onPress={() => {
              console.log('Button pressed');
              submitReview();
            }}
          >
            <Text style={styles.submitButtonText}>Submit Review</Text>
          </TouchableOpacity>
        </View>
      )}

      {loading ? (
        <Text>Loading reviews...</Text>
      ) : reviews.length > 0 ? (
        <FlatList 
          data={reviews}
          renderItem={renderReview}
          keyExtractor={(item) => item.id || Math.random().toString()}
          scrollEnabled={false}
        />
      ) : (
        <Text style={styles.noReviews}>No reviews yet. Be the first to write one!</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  addReviewButton: {
    backgroundColor: '#FF3B30',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 4,
  },
  addReviewButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  reviewForm: {
    backgroundColor: '#f9f9f9',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  input: {
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 4,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  commentInput: {
    height: 100,
    textAlignVertical: 'top',
  },
  ratingInput: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  starContainer: {
    flexDirection: 'row',
  },
  starIcon: {
    marginHorizontal: 2,
  },
  submitButton: {
    backgroundColor: '#FF3B30',
    padding: 12,
    borderRadius: 4,
    alignItems: 'center',
  },
  submitButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  reviewItem: {
    backgroundColor: 'white',
    padding: 16,
    marginBottom: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#eee',
  },
  reviewUserName: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 4,
  },
  ratingContainer: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  reviewDate: {
    color: '#888',
    fontSize: 12,
    marginBottom: 8,
  },
  reviewComment: {
    lineHeight: 20,
  },
  noReviews: {
    fontStyle: 'italic',
    color: '#888',
    textAlign: 'center',
    marginTop: 20,
  },
});

export default ReviewsSection;