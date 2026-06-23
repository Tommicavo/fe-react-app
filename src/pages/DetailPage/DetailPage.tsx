import { useParams } from "react-router-dom";

function DetailPage() {
  const { id } = useParams<{ id: string }>();

  return (
    <div className="container">
      <h1>Detail Page for ID: {id}</h1>
    </div>
  );
}

export default DetailPage;
