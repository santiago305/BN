import AppLogoIcon from './app-logo-icon';

export default function AppLogo() {
    return (
        <>
            <div className="flex aspect-square size-8 items-center justify-center rounded-md  bg-[#C41D1D] dark:bg-white text-sidebar-primary-foreground">
                <AppLogoIcon className="size-5 fill-current text-white dark:text-[#C41D1D]" />
            </div>
            <div className="ml-1 grid flex-1 text-left text-sm">
                <span className="mb-0.5 truncate leading-tight font-semibold">
                    Fuvexbn
                </span>
            </div>
        </>
    );
}
