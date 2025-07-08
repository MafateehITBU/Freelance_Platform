import MasterLayout from "../masterLayout/MasterLayout";
import Breadcrumb from "../components/Breadcrumb";
import PostsLayer from "../components/PostsLayer";


const PostsPage = () => {
    return (
        <MasterLayout>
            <Breadcrumb title="Posts" />
            
            <PostsLayer />
        </MasterLayout>
    );
}

export default PostsPage;