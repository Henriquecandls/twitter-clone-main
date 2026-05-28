import type { DiscoverUser } from "../types";

type Props = {
  currentUserId: number | null;
  users: DiscoverUser[];
  onToggleFollow: (user: DiscoverUser) => void;
};

export function People({ currentUserId, users, onToggleFollow }: Props) {
  const otherUsers = users.filter((u) => u.id !== currentUserId);

  return (
    <div>
      {otherUsers.length === 0 ? (
        <div className="text-muted">No other users</div>
      ) : (
        otherUsers.map((user) => (
          <div
            key={user.id}
            className="d-flex align-items-center justify-content-between mb-2"
          >
            <div>@{user.username}</div>
            <button
              type="button"
              className={`btn btn-sm ${
                user.is_following ? "btn-danger" : "btn-outline-primary"
              }`}
              onClick={() => onToggleFollow(user)}
            >
              {user.is_following ? "Unfollow" : "Follow"}
            </button>
          </div>
        ))
      )}
    </div>
  );
}
