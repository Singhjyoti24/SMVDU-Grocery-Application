import React from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { HousePlug, Menu, ShoppingCart, User, LogOut } from 'lucide-react'
import { Sheet, SheetContent, SheetTrigger } from '../ui/sheet'
import { Button } from '../ui/button'
import { useSelector } from 'react-redux'
import { shoppingViewHeaderMenuItems } from '@/config'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { useNavigate } from 'react-router-dom';
import { logoutUser } from '@/store/auth-slice'
import { useDispatch } from 'react-redux'
import CartWrapper from './CartWrapper'
import { useState, useEffect } from 'react'
import { fetchCartItems } from '@/store/shop/cart-slice';
import { Label } from '../ui/label'
import { useLocation } from 'react-router-dom'

function MenuItems() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();

  function handleNavigate(getCurrentMenuItem) {
    sessionStorage.removeItem("filters");
    const currentFilter =
      getCurrentMenuItem.id !== "home" && getCurrentMenuItem.id !== "products"
        &&
        getCurrentMenuItem.id !== "search"
        ? {
          category: [getCurrentMenuItem.id],
        }
        : null;

    sessionStorage.setItem("filters", JSON.stringify(currentFilter));

    location.pathname.includes("list") && currentFilter !== null
      ? setSearchParams(
        new URLSearchParams(`?category=${getCurrentMenuItem.id}`)
      )
      : navigate(getCurrentMenuItem.path);
    navigate(getCurrentMenuItem.path);
  }

  return (
    <nav className="flex flex-col mb-3 lg:mb-0 lg:items-center gap-6 lg:flex-row text-black">
      {shoppingViewHeaderMenuItems.map((menuItem) => (
        <Label
          onClick={() => handleNavigate(menuItem)}
          className='text-sm cursor-pointer font-medium'
          key={menuItem.id}
        >
          {menuItem.label}
        </Label>
      ))}
    </nav>
  );
}

function HeaderRightContent() {
  const { user } = useSelector((state) => state.auth);
  const { cartItems } = useSelector((state) => state.shopCart);
  const [openCartSheet, setOpenCartSheet] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  function handleLogout() {
    dispatch(logoutUser());
  }

  useEffect(() => {
    dispatch(fetchCartItems(user?.id));
  }, [dispatch]);

  console.log(cartItems);

  return (
    <div className="flex lg:items-center lg:flex-row flex-col gap-4">
      <Sheet open={openCartSheet} onOpenChange={() => setOpenCartSheet(false)}>
        <Button onClick={() => setOpenCartSheet(true)} variant="outline" size="icon" className="relative">
          <ShoppingCart className='w-6 h-6'></ShoppingCart>
          <span className='absolute top-[-5px] font-bold right-[2px] text-sm'>{cartItems?.items?.length || '0'}</span>
          <span className='sr-only'>User cart</span>
        </Button>
        <CartWrapper
          setOpenCartSheet={setOpenCartSheet}
          cartItems={
            cartItems && cartItems.items && cartItems.items.length > 0
              ? cartItems.items
              : []
          } />
      </Sheet>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Avatar className="bg-lime-600">
            <AvatarFallback className="bg-lime-600 text-black font-extrabold">
              {user?.userName[0].toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </DropdownMenuTrigger>
        <DropdownMenuContent side="right" className="w-56">
          <DropdownMenuLabel>Logged in as {user?.userName}</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => navigate("/shop/account")}>
            <User className="mr-2 h-4 w-4" />
            Account
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

function ShopHeader() {
  const { isAuthenticated } = useSelector(state => state.auth);

  return <header className='sticky top-0 z-40 w-full border-b bg-background'>
    <div className="flex h-16 items-center justify-between px-4 md:px-6">
      <Link to="/shop/home" className='flex items-center gap-2'>
        <HousePlug className='h-6 w-6' />
        <span className='font-bold'>SMVDU Grocery</span>
      </Link>

      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" size="icon" className="lg:hidden">
            <Menu className='h-6 w-6' />
            <span className='sr-only'>Toggle header menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-full max-w-xs">
          <MenuItems />
          <HeaderRightContent />
        </SheetContent>
      </Sheet>
      <div className='hidden lg:block'>
        <MenuItems />
      </div>
      <div className='hidden lg:block'>
        <HeaderRightContent />
      </div>
    </div>
  </header>
}

export default ShopHeader