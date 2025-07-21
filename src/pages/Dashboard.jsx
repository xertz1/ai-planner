import React, { useState, useRef, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import timeGridPlugin from '@fullcalendar/timegrid';
import { db } from '../firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';
import '../components/dashboard.css'
import { motion } from 'framer-motion'

// AI ADDITION
import AiCommandBox from '../components/AiCommandBox.jsx';

const Dashboard = () => {
  const [showModal, setShowModal] = useState(false);
  const [clickedDate, setClickedDate] = useState(null);
  const [title, setTitle] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [events, setEvents] = useState([]);
  const [view, setView] = useState('dayGridMonth');
  const calendarRef = useRef(null);

  // AI ADDITION
  const [aiPreview, setAiPreview] = useState(null);
  const [aiError] = useState('');

  const cycleView = () => {
    const views = ['timeGridWeek', 'timeGridDay', 'dayGridMonth'];
    const nextIndex = (views.indexOf(view) + 1) % views.length;
    const nextView = views[nextIndex];

    const calendarApi = calendarRef.current.getApi();
    calendarApi.changeView(nextView);
    setView(nextView);
  };

  const saveEventsToFirestore = async (events) => {
    const user = auth.currentUser;
    if (!user) return;

    const userRef = doc(db, 'users', user.uid);
    await setDoc(userRef, { events: events }, { merge: true });
  };

  const handleEventClick = async (clickInfo) => {
    const updatedEvents = events.filter(
      (event) =>
        !(
          event.title === clickInfo.event.title &&
          clickInfo.event.startTime === event.startTime &&
          clickInfo.event.endDateTime === event.endTime
        )
    );

    setEvents(updatedEvents);
    await saveEventsToFirestore(updatedEvents);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        console.log("No user is currently logged in.");
        return;
      }

      const userRef = doc(db, 'users', user.uid);
      const docSnap = await getDoc(userRef);
      if (docSnap.exists() && docSnap.data().events) {
        setEvents(docSnap.data().events);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleDateClick = (arg) => {
    setClickedDate(arg.dateStr);
    setShowModal(true);
  };

  const handleAddEvent = async (e) => {
    e.preventDefault();

    const isValidTime = (time) => /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(time);

    if (!title || !startTime || !endTime) {
      alert('All fields are required');
      return;
    }

    if (!isValidTime(startTime) || !isValidTime(endTime)) {
      alert('Invalid time format. Please use HH:MM in 24hr format');
      return;
    }

    const [startHour, startMin] = startTime.split(':').map(Number);
    const [endHour, endMin] = endTime.split(':').map(Number);

    if (startHour * 60 + startMin >= endHour * 60 + endMin) {
      alert('End time must be after start time.');
      return;
    }

    const startDateTime = `${clickedDate}T${startTime}:00`;
    const endDateTime = `${clickedDate}T${endTime}:00`;

    const newEvents = [...events, { title, start: startDateTime, end: endDateTime }];
    setEvents(newEvents);
    await saveEventsToFirestore(newEvents);

    setShowModal(false);
    setTitle('');
    setStartTime('');
    setEndTime('');
    setClickedDate(null);
  };

  // AI ADDITION: apply operations from preview
  const applyAiOperations = async () => {
    if (!aiPreview) return;

    let updatedEvents = [...events];

    aiPreview.operations.forEach(op => {
      if (op.action === 'create') {
        const date = op.date || new Date().toISOString().split('T')[0];
        updatedEvents.push({
          id: 'ai_' + Date.now(),
          title: op.title || 'Untitled',
          start: `${date}T${op.startTime || '09:00'}:00`,
          end: `${date}T${op.endTime || '10:00'}:00`,
        });
      } else if (op.action === 'delete') {
        updatedEvents = updatedEvents.filter(ev => ev.id !== op.id);
      } else if (op.action === 'update') {
        updatedEvents = updatedEvents.map(ev =>
          ev.id === op.id
            ? { ...ev, title: op.title || ev.title }
            : ev
        );
      }
    });

    setEvents(updatedEvents);
    await saveEventsToFirestore(updatedEvents);
    setAiPreview(null);
  };

  return (
    <div>
      {showModal && (
        <div className='modal'> 
             <motion.div initial={{ scale: 0.9, opacity: 0}} animate={{ scale: 1, opacity: 1}} transition={{ duration: 0.3 }}>
                <div className='modal-content'>
                    <h2>Add Event</h2>
                        <form className='event-form' onSubmit={handleAddEvent}>
                            <label>
                                Title:
                                <input type='text' value={title} onChange={(e) => setTitle(e.target.value)}/>
                            </label>
                            <label>
                                Start Time (HH:MM):
                                <input type='text' value={startTime} onChange={(e) => setStartTime(e.target.value)}/>
                            </label>
                            <label>
                                End Time (HH:MM):
                                <input type='text' value={endTime} onChange={(e) => setEndTime(e.target.value)}/>
                            </label>
                            <div className='button-row'>
                                <button type='submit'>Add</button>
                            <button onClick={() => setShowModal(false)}>Cancel</button>
                            </div>
                        </form>
                </div>
            </motion.div>
        </div>
      )}
        <div className='dashboard-container'>
            <div className='upper-dashboard-section'>
                <div className='calendar-container'>
                        <FullCalendar
                        ref={calendarRef}
                        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                        initialView={view}
                        events={events}
                        dateClick={handleDateClick}
                        eventClick={handleEventClick}
                        height='auto'
                        />
                </div>
                <button onClick={cycleView}>Change View ({view.replace('Grid', '')})</button>
            </div>

            {/* AI ADDITION */}
            <AiCommandBox existingEvents={events} onPreview={setAiPreview} />
            {aiError && <div style={{ color: 'red' }}>{aiError}</div>}
            {aiPreview && (
              <div className="ai-preview-box">
                <h3>AI Suggested Operations:</h3>
                <ul>
                  {aiPreview.operations.map((op, idx) => (
                    <li key={idx}>
                      {op.action} {op.title || op.id}
                      {op.date && ` on ${op.date} (${op.startTime}-${op.endTime})`}
                    </li>
                  ))}
                </ul>
                {aiPreview.ambiguities && aiPreview.ambiguities.length > 0 && (
                  <div style={{ color: 'orange' }}>
                    <strong>Ambiguities:</strong>
                    <ul>
                      {aiPreview.ambiguities.map((a, i) => (
                        <li key={i}>{a}</li>
                      ))}
                    </ul>
                  </div>
                )}
                <button onClick={applyAiOperations}>Apply AI Changes</button>
                <button onClick={() => setAiPreview(null)} style={{ marginLeft: '8px' }}>Cancel</button>
              </div>
            )}
        </div>
    </div>
  );
};

export default Dashboard;
