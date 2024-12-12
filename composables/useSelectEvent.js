// useEvent.js
// import eventsList from './eventData';

const selectedEvent = ref([]);
export const useSelectEvent = () => {

    const setSelectedEvent = (newEvent) => {
      selectedEvent.value = newEvent;
      console.log('02',selectedEvent.value );
    };
  
    return {
      selectedEvent,
      setSelectedEvent,
    };
};
