import MasterLayout from "../masterLayout/MasterLayout";
import Breadcrumb from "../components/Breadcrumb";
import InfluencersLayer from "../components/InfluencersLayer";

const InfluencersPage = () => {
    return (
        <MasterLayout>
            <Breadcrumb title="Influencers"/>
           
           <InfluencersLayer />
        </MasterLayout>
    );
}

export default InfluencersPage;