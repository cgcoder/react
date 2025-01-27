import { LandingPage } from './LandingPage';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import AppLayout from './AppLayout';
import NewProject from './NewProject';

export default function Router() {
    return <BrowserRouter>
        <Routes>
            <Route path="/" element={<AppLayout />}>
                <Route index element={<LandingPage />} />
                <Route path="editor/:id" element={<NewProject />} />
            </Route>
        </Routes>
    </BrowserRouter>
}