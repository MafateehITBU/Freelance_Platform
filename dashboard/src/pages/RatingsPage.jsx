import MasterLayout from "../masterLayout/MasterLayout";
import Breadcrumb from "../components/Breadcrumb";
import RatingsLayer from "../components/RatingsLayer";


function RatingsPage() {
    return (
        <MasterLayout>
            <Breadcrumb title="Ratings" />
            <RatingsLayer />
        </MasterLayout>
    );
}

export default RatingsPage;