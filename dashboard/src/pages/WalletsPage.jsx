import MasterLayout from "../masterLayout/MasterLayout";
import Breadcrumb from "../components/Breadcrumb";
import WalletsLayer from "../components/WalletsLayer";


const WalletsPage = () => {
  return (
    <MasterLayout>
      <Breadcrumb title="Wallets" />
      <WalletsLayer />
    </MasterLayout>
  );
}

export default WalletsPage;