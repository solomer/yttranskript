import VideoList from './VideoList';

export default function PlaylistCard({ playlist, isDark }) {
  return (
    <div>
      <VideoList playlistId={playlist.id} isDark={isDark} />
    </div>
  );
}
