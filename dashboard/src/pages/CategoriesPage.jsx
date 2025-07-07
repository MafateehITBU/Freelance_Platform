import MasterLayout from "../masterLayout/MasterLayout";
import Breadcrumb from "../components/Breadcrumb";
import CategoriesLayer from "../components/CategoriesLayer";

const CategoriesPage = () => {
    return (
        <MasterLayout>
            <Breadcrumb title="Categories"/>
           
           <CategoriesLayer />
        </MasterLayout>
    );
}

export default CategoriesPage;