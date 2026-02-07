import { useState, useEffect, useCallback } from 'react';
import { seedDatabase } from './seed';
import {
  usePosts,
  useMessages,
  useCurrentUser,
  useInterests,
  useCreatePost,
  useCreateMessage,
  useUpvotePost,
  useUpvoteMessage,
  useNeurons,
} from './hooks';
import type { NetworkType } from './types';
import TopNav from './components/TopNav';
import SidebarLeft from './components/SidebarLeft';
import FeedCenter from './components/FeedCenter';
import PostDetail from './components/PostDetail';
import NeuronPanel from './components/NeuronPanel';
import NewPostModal from './components/NewPostModal';
import { db } from './db';

export default function App() {
  const [ready, setReady] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedNetwork, setSelectedNetwork] = useState<NetworkType | null>(null);
  const [selectedPostId, setSelectedPostId] = useState<number | null>(null);
  const [showNewPost, setShowNewPost] = useState(false);

  const currentUser = useCurrentUser();
  const { posts, refresh: refreshPosts } = usePosts(selectedNetwork, search);
  const { messages, refresh: refreshMessages } = useMessages(selectedPostId);
  const { interests, toggleInterest } = useInterests(currentUser?.id ?? null);
  const { neurons, refresh: refreshNeurons } = useNeurons(selectedNetwork);
  const createPost = useCreatePost();
  const createMessage = useCreateMessage();
  const upvotePost = useUpvotePost();
  const upvoteMessage = useUpvoteMessage();

  // Initialize
  useEffect(() => {
    seedDatabase().then(() => setReady(true));
  }, []);

  // Refresh posts when ready
  useEffect(() => {
    if (ready) refreshPosts();
  }, [ready, refreshPosts]);

  const selectedPost = posts.find((p) => p.id === selectedPostId) ?? null;

  const handleNewPost = useCallback(
    async (title: string, content: string, tags: string[], network: NetworkType) => {
      if (!currentUser?.id) return;
      await createPost(currentUser.id, title, content, tags, network);
      setShowNewPost(false);
      refreshPosts();
      refreshNeurons();
    },
    [currentUser, createPost, refreshPosts, refreshNeurons]
  );

  const handleSendMessage = useCallback(
    async (content: string) => {
      if (!selectedPostId || !currentUser?.id) return;
      await createMessage(selectedPostId, currentUser.id, content);
      refreshMessages();
      refreshPosts();
      refreshNeurons();
    },
    [selectedPostId, currentUser, createMessage, refreshMessages, refreshPosts, refreshNeurons]
  );

  const handleUpvotePost = useCallback(
    async (id: number) => {
      await upvotePost(id);
      refreshPosts();
    },
    [upvotePost, refreshPosts]
  );

  const handleUpvoteMessage = useCallback(
    async (id: number) => {
      await upvoteMessage(id);
      refreshMessages();
    },
    [upvoteMessage, refreshMessages]
  );

  const handleToggleInterest = useCallback(
    async (tag: string) => {
      await toggleInterest(tag);
      refreshNeurons();
    },
    [toggleInterest, refreshNeurons]
  );

  const handleGlobalRefresh = useCallback(async () => {
    // Used after import: re-seed if needed, then refresh everything
    const count = await db.users.count();
    if (count === 0) await seedDatabase();
    refreshPosts();
    refreshNeurons();
  }, [refreshPosts, refreshNeurons]);

  if (!ready) {
    return (
      <div className="empty-state" style={{ height: '100vh' }}>
        <div className="empty-icon">&#x1F9E0;&#xFE0E;</div>
        <p>Initializing neural networks...</p>
      </div>
    );
  }

  return (
    <>
      <TopNav
        search={search}
        onSearchChange={setSearch}
        currentUser={currentUser}
        onRefresh={handleGlobalRefresh}
      />

      <div className="app-layout">
        <SidebarLeft
          selectedNetwork={selectedNetwork}
          onNetworkChange={setSelectedNetwork}
          interests={interests}
          onToggleInterest={handleToggleInterest}
        />

        <FeedCenter
          posts={posts}
          selectedPostId={selectedPostId}
          onSelectPost={setSelectedPostId}
          onNewPost={() => setShowNewPost(true)}
          onUpvote={handleUpvotePost}
        />

        <aside className="panel-right">
          {selectedPost ? (
            <PostDetail
              post={selectedPost}
              messages={messages}
              onSendMessage={handleSendMessage}
              onUpvoteMessage={handleUpvoteMessage}
            />
          ) : (
            <div className="post-detail glass">
              <div className="empty-state">
                <div className="empty-icon">&#x1F4CB;&#xFE0E;</div>
                <p>Select a post to view details</p>
              </div>
            </div>
          )}

          <NeuronPanel neurons={neurons} />
        </aside>
      </div>

      {showNewPost && (
        <NewPostModal onSubmit={handleNewPost} onClose={() => setShowNewPost(false)} />
      )}
    </>
  );
}
