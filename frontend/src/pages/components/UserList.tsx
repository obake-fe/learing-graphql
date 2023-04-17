type OwnProps = {
  count: number;
};

export const UserList = ({ count }: OwnProps): JSX.Element => {
  return (
    <div>
      <p>{count} Users</p>
    </div>
  );
};
