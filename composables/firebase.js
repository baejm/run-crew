// import { useNuxtApp } from '#app'
import { collection, getDocs, addDoc } from 'firebase/firestore'

export const useFirestore = () => {
  const { $db } = useNuxtApp()

  // Firestore 컬렉션에서 모든 문서 가져오기
//   const fetchEvents = async () => {
//     const eventsCollection = collection($db, 'events')
//     const snapshot = await getDocs(eventsCollection)
//     return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
//   }

    // Firestore 컬렉션에 새 문서 추가
    // const addEvent = async (event) => {
    //     const eventsCollection = collection($db, 'events')
    //     await addDoc(eventsCollection, event)
    //     }


// Firestore 이벤트 조회
    const fetchEvents = async () => {
        try {
          const querySnapshot = await getDocs(collection(db, 'events'));
          const events = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
          }));
          console.log('Events:', events);
        } catch (error) {
          console.error('Error fetching events:', error);
        }
      };

   // Firestore 이벤트 추가
   const addEvent = async () => {
    try {
      const docRef = await addDoc(collection(db, 'events'), {
        title: 'Example Event',
        dates: new Date(), // 날짜
        startTime: '10:00 AM',
        endTime: '2:00 PM',
        capacity: 30,
        place: 'Online',
        description: 'This is an example event.',
      });
      console.log('Event added with ID:', docRef.id);
    } catch (error) {
      console.error('Error adding event:', error);
    }
  };



  return {
    fetchEvents,
    addEvent
  }
}
