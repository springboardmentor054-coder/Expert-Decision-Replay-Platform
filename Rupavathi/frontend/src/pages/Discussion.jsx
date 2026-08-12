import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { commentAPI, decisionAPI, meetingNoteAPI, extractErrorMessage } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import BackButton from '../components/BackButton';
import './Discussion.css';

function formatDateTime(isoString) {
  if (!isoString) return '';
  return new Date(isoString).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

function initials(name) {
  return (name || '?').charAt(0).toUpperCase();
}

function CommentItem({ comment, isOwner, onSave, onDelete }) {
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(comment.comment);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const wasEdited = comment.updated_at !== comment.created_at;

  const handleSave = async () => {
    if (!draft.trim()) {
      setError('Comment cannot be empty.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      await onSave(comment.id, draft.trim());
      setIsEditing(false);
    } catch (err) {
      setError(err.message || 'Could not save comment.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="comment-item">
      <div className="comment-avatar">{initials(comment.author.full_name)}</div>
      <div className="comment-body">
        <div className="comment-header">
          <span className="comment-author">{comment.author.full_name}</span>
          <span className="comment-date">{formatDateTime(comment.created_at)}</span>
          {wasEdited && <span className="comment-date-edited">(edited)</span>}
        </div>

        {isEditing ? (
          <>
            <textarea
              className="comment-edit-textarea"
              rows={3}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
            />
            {error && <p className="discussion-form-error">{error}</p>}
            <div className="comment-actions">
              <button className="comment-action-link" onClick={handleSave} disabled={saving}>
                {saving ? 'Saving...' : 'Save'}
              </button>
              <button
                className="comment-action-link"
                onClick={() => {
                  setIsEditing(false);
                  setDraft(comment.comment);
                  setError('');
                }}
              >
                Cancel
              </button>
            </div>
          </>
        ) : (
          <>
            <p className="comment-text">{comment.comment}</p>
            {isOwner && (
              <div className="comment-actions">
                <button className="comment-action-link" onClick={() => setIsEditing(true)}>
                  Edit
                </button>
                <button
                  className="comment-action-link comment-action-link-danger"
                  onClick={() => onDelete(comment.id)}
                >
                  Delete
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function MeetingNoteEntry({ note, onDelete }) {
  return (
    <div className="meeting-note-entry">
      <p className="meeting-note-entry-meta">
        {note.creator.full_name} &middot; {formatDateTime(note.created_at)}
      </p>
      <div className="meeting-note-entry-row">
        <p className="meeting-note-entry-label">Meeting Summary</p>
        <p className="meeting-note-entry-value">{note.meeting_summary}</p>
      </div>
      {note.conclusion && (
        <div className="meeting-note-entry-row">
          <p className="meeting-note-entry-label">Conclusion</p>
          <p className="meeting-note-entry-value">{note.conclusion}</p>
        </div>
      )}
      {note.next_action && (
        <div className="meeting-note-entry-row">
          <p className="meeting-note-entry-label">Next Action</p>
          <p className="meeting-note-entry-value">{note.next_action}</p>
        </div>
      )}
      <div className="comment-actions">
        <button className="comment-action-link comment-action-link-danger" onClick={() => onDelete(note.id)}>
          Delete
        </button>
      </div>
    </div>
  );
}

function Discussion() {
  const { decisionId } = useParams();
  const { user } = useAuth();
  const { showToast } = useToast();
  const [decision, setDecision] = useState(null);
  const [comments, setComments] = useState([]);
  const [meetingNotes, setMeetingNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [newComment, setNewComment] = useState('');
  const [posting, setPosting] = useState(false);

  const [meetingSummary, setMeetingSummary] = useState('');
  const [conclusion, setConclusion] = useState('');
  const [nextAction, setNextAction] = useState('');
  const [noteError, setNoteError] = useState('');
  const [savingNote, setSavingNote] = useState(false);

  const loadData = () => {
    setLoading(true);
    Promise.all([
      decisionAPI.get(decisionId),
      commentAPI.listForDecision(decisionId),
      meetingNoteAPI.listForDecision(decisionId),
    ])
      .then(([decisionRes, commentsRes, notesRes]) => {
        setDecision(decisionRes.data);
        setComments(commentsRes.data);
        setMeetingNotes(notesRes.data);
      })
      .catch((err) => setError(extractErrorMessage(err, 'Could not load the discussion.')))
      .finally(() => setLoading(false));
  };

  useEffect(loadData, [decisionId]);

  const handleAddMeetingNote = async (e) => {
    e.preventDefault();
    setNoteError('');

    if (!meetingSummary.trim()) {
      setNoteError('Meeting summary cannot be empty.');
      return;
    }

    setSavingNote(true);
    try {
      const { data } = await meetingNoteAPI.create({
        decision_id: Number(decisionId),
        meeting_summary: meetingSummary.trim(),
        conclusion: conclusion.trim() || null,
        next_action: nextAction.trim() || null,
      });
      setMeetingNotes((prev) => [...prev, data]);
      setMeetingSummary('');
      setConclusion('');
      setNextAction('');
      showToast('Meeting note saved successfully!', 'success');
    } catch (err) {
      setNoteError(extractErrorMessage(err, 'Could not save meeting note.'));
    } finally {
      setSavingNote(false);
    }
  };

  const handleDeleteMeetingNote = async (noteId) => {
    if (!window.confirm('Delete this meeting note? This cannot be undone.')) return;
    try {
      await meetingNoteAPI.remove(noteId);
      setMeetingNotes((prev) => prev.filter((n) => n.id !== noteId));
      showToast('Meeting note deleted successfully!', 'success');
    } catch (err) {
      setNoteError(extractErrorMessage(err, 'Could not delete meeting note.'));
    }
  };

  const handlePostComment = async (e) => {
    e.preventDefault();
    setError('');

    if (!newComment.trim()) {
      setError('Comment cannot be empty.');
      return;
    }

    setPosting(true);
    try {
      const { data } = await commentAPI.create(decisionId, newComment.trim());
      setComments((prev) => [...prev, data]);
      setNewComment('');
      showToast('Comment posted successfully!', 'success');
    } catch (err) {
      setError(extractErrorMessage(err, 'Could not post comment.'));
    } finally {
      setPosting(false);
    }
  };

  const handleSaveEdit = async (commentId, newText) => {
    try {
      const { data } = await commentAPI.update(commentId, newText);
      setComments((prev) => prev.map((c) => (c.id === commentId ? data : c)));
      showToast('Comment updated successfully!', 'success');
    } catch (err) {
      throw new Error(extractErrorMessage(err, 'Could not save comment.'));
    }
  };

  const handleDelete = async (commentId) => {
    if (!window.confirm('Delete this comment? This cannot be undone.')) return;
    try {
      await commentAPI.remove(commentId);
      setComments((prev) => prev.filter((c) => c.id !== commentId));
      showToast('Comment deleted successfully!', 'success');
    } catch (err) {
      setError(extractErrorMessage(err, 'Could not delete comment.'));
    }
  };

  return (
    <div className="discussion-page">
      <BackButton to={`/dashboard/decisions/${decisionId}`}>Back to Decision</BackButton>

      <div className="discussion-page-header">
        <h1>Discussion{decision ? ` for "${decision.title}"` : ''}</h1>
        <p>Discuss this decision with your team before it's finalized.</p>
      </div>

      <div className="discussion-panel discussion-add-comment">
        <h2>Add Comment</h2>
        {error && <p className="discussion-form-error">{error}</p>}
        <form onSubmit={handlePostComment}>
          <textarea
            rows={3}
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Share your thoughts on this decision..."
          />
          <div className="discussion-add-comment-actions">
            <button type="submit" className="discussion-submit-btn" disabled={posting}>
              {posting ? 'Posting...' : 'Post Comment'}
            </button>
          </div>
        </form>
      </div>

      <div className="discussion-panel">
        <h2>Comments</h2>
        {loading ? (
          <div className="discussion-loading">Loading comments...</div>
        ) : comments.length === 0 ? (
          <div className="discussion-empty">No comments yet. Start the discussion above.</div>
        ) : (
          <div className="comment-list">
            {comments.map((comment) => (
              <CommentItem
                key={comment.id}
                comment={comment}
                isOwner={comment.user_id === user?.id}
                onSave={handleSaveEdit}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>

      <div className="discussion-panel">
        <h2>Meeting Notes</h2>
        {noteError && <p className="discussion-form-error">{noteError}</p>}
        <form onSubmit={handleAddMeetingNote}>
          <div className="meeting-notes-field">
            <label htmlFor="meeting_summary">
              Meeting Summary <span style={{ color: '#c0392b' }}>*</span>
            </label>
            <textarea
              id="meeting_summary"
              rows={3}
              value={meetingSummary}
              onChange={(e) => setMeetingSummary(e.target.value)}
              placeholder="What was discussed in this meeting?"
            />
          </div>
          <div className="meeting-notes-field">
            <label htmlFor="conclusion">Conclusion</label>
            <textarea
              id="conclusion"
              rows={2}
              value={conclusion}
              onChange={(e) => setConclusion(e.target.value)}
              placeholder="What was concluded?"
            />
          </div>
          <div className="meeting-notes-field">
            <label htmlFor="next_action">Next Action</label>
            <textarea
              id="next_action"
              rows={2}
              value={nextAction}
              onChange={(e) => setNextAction(e.target.value)}
              placeholder="What happens next?"
            />
          </div>
          <div className="discussion-add-comment-actions">
            <button type="submit" className="discussion-submit-btn" disabled={savingNote}>
              {savingNote ? 'Saving...' : 'Save Meeting Note'}
            </button>
          </div>
        </form>

        {loading ? (
          <div className="discussion-loading">Loading meeting notes...</div>
        ) : meetingNotes.length === 0 ? (
          <div className="discussion-empty">No meeting notes yet.</div>
        ) : (
          <div style={{ marginTop: 20 }}>
            {meetingNotes.map((note) => (
              <MeetingNoteEntry key={note.id} note={note} onDelete={handleDeleteMeetingNote} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Discussion;
