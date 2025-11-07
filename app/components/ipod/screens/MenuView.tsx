export const MenuItems = ["Music", "Settings", "Shuffle Songs" ]

export default function MenuView () {
    return (
        <div>
            <ul>
               {MenuItems.map(item => <li key={item}>item</li>)}
            </ul>
        </div>
    );
}